var myDropzone = null;
var defaultMsClick = true;
var currentFile = null;
var downloadLinkBatchMetaFile = null;

var formData = {
	targetType: null,
	recipient: null,
	label: null,
	target: null,
	dateStamp: null,
	guid: null,
	user: null,
	wasabiUploadType: null,
	private: null,
	assets: []
};

var creatorNames = [];
var creatorName = {
	creator: "",
	irn: ""
};

var creatorNameListOpen = false;

var showMoreInfoPopup;

var activeAsset = -1;
var sessionGUID = null;

var searchTextEvent = "";
var searchTextRecord = "";

var selectedEvent = null;
var selectedRecord = null;
var selectedTarget = null;

var jsonDataPeople = {};
var jsonDataUsers = {};
var jsonDataEvents = {};
var jsonDataRecords = {};
var jsonDataWasabi = {};
var jsonDataFileTypes = {};

var jsonMorphoSourceResults = {};
var msImageThumbs = [];
var msPageResponses = [];
var msData = [];
var msFinalData = [];

var isEmbargoed = false;
var wasabiUploadType = "standard";
var wasabiUploadTypeHelpText = {
	"standard": "Standard upload path: one EMu catalog number plus file upload.",
	"batch": "Alternative upload path: link metadata to a massive ZIP file which is uploaded later.",
	"morphosource": "Link a catalog number to an existing asset on MorphoSource.  No upload."
}

var dropzoneHelpText = {
	"standard": "Standard asset upload.  Files will immediately be copied to server.",
	"batch": "Select assets from your hard drive as usual.  No files will be uploaded.",
	"morphosource": "Assets will not be uploaded; Select existing MorphoSource records."
}

var initialSearchType = "";
var searchType = "";

var CASuser = {
	name: "",
	type: ""
};


Dropzone.autoDiscover = false;
$(document).ready(function () {
	jsonDataUsers = loadJsonAsVar("data/users.json?v=" + randomNumber());
	jsonDataEvents = loadJsonAsVar("../data/ingester-metadata-netx.json?v=" + randomNumber());
	jsonDataPeople = loadJsonAsVar("../data/ingester-metadata-people.json?v=" + randomNumber());
	jsonDataRecords = loadJsonAsVar("../data/ingester-metadata-specimens.json?v=" + randomNumber());
	jsonDataWasabi = loadJsonAsVar("../data/ypm_asset_summary.json?v=" + randomNumber());
	jsonDataFileTypes = loadJsonAsVar("../data/filetypes.json?v=" + randomNumber());

	detectUser();
	getPageWidth();
	resetSelects();
	activateAgentLookup();

	clearForm();

	$(window).resize(function () {
		getPageWidth();
	});

	checkFreeSpace();
	
	
	
	
	myDropzone = new Dropzone("div#dropzoneArea", {
		acceptedMimeTypes: null, //DEPRECATED
		autoProcessQueue: true, //if false, queue will not be processed automatically.
		autoQueue: true, //if false, files added to the dropzone will not be queued by default.
		capture: null, //null|camera|microphone|camcorder.  multiple=false for apple devices
		chunking: true,
		chunkSize: 500000000, //bytes
		clickable: true,
		createImageThumbnails: true,
		dictDefaultMessage: "<h2 class='pulsate align-center'>DROP FILES / CLICK HERE<br /><i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i></h2>",
		dictFileTooBig: "Sorry, this file is too large.<br /><br />Your file size: <strong>{{filesize}} MB</strong><br />Maximum size: <strong>{{maxFilesize}} MB</strong>",
		dictInvalidFileType: "Invalid file type.",
		dictResponseError: "Server error code: {{statusCode}}",
		dictMaxFilesExceeded: "Too many files uploaded.  Maximum: {{maxFiles}}",
		filesizeBase: 1024, //1000|1024
		forceChunking: false,
		forceFallback: false,
		headers: {
			"type": searchType,
			"folderName": sessionGUID
		}, //json object to send to server
		hiddenInputContainer: "body",
		ignoreHiddenFiles: false,
		maxFiles: 50, //limit the maximum number of files that will be handled by this Dropzone
		maxFilesize: 60000, // MB
		maxThumbnailFilesize: 240, //mb
		maxParallelUploads: 50,
		method: "post",
		parallelChunkUploads: false,
		parallelUploads: 2,
		paramName: "file", // The name that will be used to transfer the file
		previewsContainer: null, //null=dropzone container|$("#element).dropzone-previews
		previewTemplate: document.querySelector("#tpl2").innerHTML,
		renameFile: null, //function that is invoked before the file is uploaded to the server and renames the file
		renameFilename: null, //DEPRECATED
		resizeWidth: null, //images will be resized to these dimensions before being uploaded
		resizeHeight: null, //images will be resized to these dimensions before being uploaded
		resizeMimeType: null, //mime type of the resized image
		resizeQuality: 0.8,
		resizeMethod: "contain", //crop|contain
		retryChunks: true,
		retryChunksLimit: 10,
		thumbnailWidth: 120, //px
		thumbnailHeight: 120, //px
		thumbnailMethod: "crop", //crop|contain
		timeout: 300000, //ms
		uploadMultiple: false,
		url: "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType,
		withCredentials: false,

		uploadprogress: function (file, progress, bytesSent) {
//			var allowUpload = true;
//			
//			if( searchType == "record") {
//				if( wasabiUploadType == "batch" || wasabiUploadType == "morphosource" ) {
//					allowUpload = false;
//				}
//			}
			
			if (file.previewElement) {
				var progressElement = file.previewElement.querySelector(
					"[data-dz-uploadprogress]"
				);
				var progressTrunc = parseFloat(progress).toFixed(1);
				progressElement.style.width = progress + "%";
				progressElement.querySelector(".progress-text").textContent = progressTrunc + "%";
			}
			
//			if( !allowUpload && progress > 0 ) {
//				myDropzone.cancelUploadAlt(file);
//			}
		},
		complete: function (file, xhr, formData) {
			//			console.log(file);
			if (file.xhr) {
//				console.log(file.xhr.responseText);
				var responseText = file.xhr.responseText;
				
				if( responseText.indexOf("error|") > -1 ) {
					var errorMessageText = responseText.split("|")[1];
					myDropzone.removeFile(file);
					showFinalErrorDialog(errorMessageText);
				}
			} else {
				console.error("error.  no upload initiated.");
			}
			if (file.previewElement) {
				var progressElement = file.previewElement.querySelector(".dz-progress");
				$(progressElement).fadeOut();
			}
			console.log(file);
		},
		error: function (file, error, xhr) {
			console.log(file);
//			console.log(error);
			showFinalErrorDialog(error);
			console.log(xhr);
//			$(file.previewElement).remove();
			myDropzone.removeFile(file);
		}

	});

	function uploadFile(file) {
		console.warn(file);
	}

	myDropzone.on("removedfile", function (file) {
		_.remove(formData.assets, {
			filename: file.name,
			filesize: file.size,
			filetype: file.type
		});
		printFormData();

		if (this.files.length) {
			$("#metadataStartButton")
				.prop("disabled", false)
				.removeClass("disabled")
				.removeClass("btn-disabled")
				.addClass("btn-primary");
		} else {
			$("#enterMetadataMessage").fadeOut();
			$("#metadataStartButton")
				.prop("disabled", "disabled")
				.addClass("disabled")
				.removeClass("btn-primary")
				.addClass("btn-disabled");
		}
	});

	
	myDropzone.on("queuecomplete", function (file) {
		if (this.files.length) {
			$("#enterMetadataMessage").fadeIn();
		} else {
			$("#enterMetadataMessage").fadeOut();
		}
		//		console.log("QUEUE COMPLETE");
	});

	myDropzone.on("addedfile", function (file) {
		
		// prevent upload if certain type of upload session
		var allowUpload = true;
		if( searchType == "record") {
			if( wasabiUploadType == "batch" || wasabiUploadType == "morphosource" ) {
				allowUpload = false;
				console.warn("upload PHP script disabled.")
				myDropzone.options.autoProcessQueue = false;
				myDropzone.options.autoQueue = false;
				$(".dropzone .dz-preview .dz-progress").css("opacity",0);
			} else {
				allowUpload = true;
				console.warn("upload PHP script enabled.")
				myDropzone.options.autoProcessQueue = true;
				myDropzone.options.autoQueue = true;
				$(".dropzone .dz-preview .dz-progress").css("opacity",1);
			}

		} else {
			allowUpload = true;
			console.warn("upload PHP script enabled.")
			myDropzone.options.autoProcessQueue = true;
			myDropzone.options.autoQueue = true;
			$(".dropzone .dz-preview .dz-progress").css("opacity",1);
		}		
		// MAY 2023 - accept only valid filenames
			// a-z,A-Z,0-9_-
		if( !safeFilename(file.name) ){

			var validFileTypesString = "." + jsonDataFileTypes.allowedFileTypes.join(", .");

			showFinalErrorDialog('<p><strong>Invalid File:</strong> <em>' + file.name + '</em></p><p>All submitted files must conform to EMu naming guidelines (only alphanumeric characters, dash (-) or underscore (_). Periods and spaces are not preferred.</p><p>Only the following file types are allowed: <br /><em>'+validFileTypesString+'</em></p><p>Please rename your file and re-upload.</p>');
			this.removeFile(file);
		}

		var package = {
			name: file.name,
			size: file.size,
			type: file.type,
			id: file.upload.uuid,
			chunked: file.upload.chunked
		};

		if (this.files.length) {
			if (this.files.length == 1) {
				setFormData("assets", package);
			} else {
				$("#enterMetadataMessage").fadeOut();
				var _i, _len;
				for (_i = 0, _len = this.files.length; _i < _len - 1; _i++) {
					if (
						this.files[_i].name === file.name &&
						this.files[_i].size === file.size &&
						this.files[_i].lastModified.toString() ===
						file.lastModified.toString()
					) {
						this.removeFile(file);
					} else {
						setFormData("assets", package);
					}
				}
			}
			$("#metadataStartButton")
				.prop("disabled", false)
				.removeClass("disabled")
				.removeClass("btn-disabled")
				.addClass("btn-primary");
		} else {
			$("#metadataStartButton")
				.prop("disabled", "disabled")
				.addClass("disabled")
				.removeClass("btn-primary")
				.addClass("btn-disabled");
		}
	});

	myDropzone.on("complete", function (file) {
		// do something
	});

	$("#metadataStartButton").click(function () {
//----- BEGIN ACTUAL CODE -----

		if (wasabiUploadType == "morphosource") {
			$(".ms-files-extra").hide();
			$(".extra-ms-info").fadeIn();
			$(".mimic-dz-item").not(".ms-file-selected").fadeOut();
			$("#morphoSourceHeadingNum").text("");
			
			$(".ms-file-selected").appendTo('#morphoSourceApiResultsRows');

			buildMorphosourceFinal();

			//remove irrelevant metadata fields
			$(".enter-metadata").removeProp("required");
			$(".enter-metadata").removeAttr("required");
			$(".ms-irrelevant").slideUp();
			$("#mainForm").validator("validate");
			$("#metadataLabelKeywords").text("Optional Notes");
			setTimeout(function () {
				$("#uploadsInfoCommonKeywords").trigger("click").focus();
			}, 1000);

			defaultMsClick = false;
		} else {
			myDropzone.removeEventListeners();
		}

		makeFilesClickable();
		$("#uploadsInfoCommon").fadeIn();

//----- END ACTUAL CODE -----
		

		
	});

	$("#goToSubmitButton").click(function () {
		
		var inProgress = _.find(myDropzone.files,function(o){ return o.status == "uploading" });
		if( typeof(inProgress) == "undefined" || inProgress == "undefined" ) {
			setFormData('dateStamp', moment().toISOString());
			makeFinalDataTable();
			showTabThree();
		} else {
			showFinalErrorDialog("Please wait!  Your assets are still uploading.");
		}
		
	});



	function makeFinalDataTable() {
		$("#finalSummary tr").not(".header").remove();

		var assetSuffix = (formData.assets.length > 1) ? "s" : "";

		$("#finalNumSubmitted").html("Ready to submit " + formData.assets.length + " asset" + assetSuffix);
		var displayData = [];

		if (wasabiUploadType == "morphosource") {
			var headerHTML = "<th><strong>#</strong></th>";
			headerHTML += "<th><strong>Media ID</strong></th>";
			headerHTML += "<th><strong>Media File ID</strong></th>";
			headerHTML += "<th><strong>Notes</strong></th>";
			headerHTML += "<th><strong>Size</strong></th>";
			headerHTML += "<th><strong>More</strong></th>";
		} else {
			var headerHTML = "<th><strong>#</strong></th>";
			headerHTML += "<th><strong>Filename</strong></th>";
			headerHTML += "<th><strong>Title</strong></th>";
			headerHTML += "<th><strong>Size</strong></th>";
			headerHTML += "<th><strong>More</strong></th>";
		}

		$("#finalSummary tr.header").html(headerHTML)

		_.forEach(formData.assets, function (asset, index) {

			if (wasabiUploadType == "morphosource") {

				var filesizeString = formData.assets[index]['media_file']['filesize'].replace('i', '');
				var unitsPos = filesizeString.indexOf(filesizeString.match(/[a-zA-Z]/));
				var filesizeStringFinal = filesizeString.substr(0, unitsPos) + " " + filesizeString.substr(unitsPos);


				var rowString = "<tr>";
				rowString += "<td>" + parseInt(index + 1) + "</td>";
				rowString += "<td><a target='_blank' href='https://www.morphosource.org/Detail/MediaDetail/Show/media_id/" + asset.media_id + "'>" + asset.media_id + "</a></td>";
				rowString += "<td>" + asset.media_file.media_file_id + "</td>";
				rowString += "<td>" + formData.assets[index].keywords + "</td>";
				rowString += "<td>" + filesizeStringFinal + "</td>";
				rowString += "<td><button type='button' onclick='showMoreInfoPopup(" + index + ")' class='btn btn-sm btn-default' title='Details'><i class='fas fa-ellipsis-h'></i></button></td>";
				rowString += "</tr>";
			} else {
				var rowString = "<tr>";
				rowString += "<td>" + parseInt(index + 1) + "</td>";
				rowString += "<td>" + asset.filename + "</td>";
				rowString += "<td>" + formData.assets[index].title + "</td>";
				rowString += "<td>" + $("span[data-dz-size]").eq(index).html() + "</td>";
				rowString += "<td><button type='button' onclick='showMoreInfoPopup(" + index + ")' class='btn btn-sm btn-default' title='Details'><i class='fas fa-ellipsis-h'></i></button></td>";
				rowString += "</tr>";
			}
			$("#finalSummary").append(rowString);
		});

	}




	showMoreInfoPopup = function (index) {
		var msgHTML = "";
		if (wasabiUploadType == "morphosource") {
		

			var filesizeString = msFinalData[index].media['filesize'].replace('i', '');
			var unitsPos = filesizeString.indexOf(filesizeString.match(/[a-zA-Z]/));
			var filesizeStringFinal = filesizeString.substr(0, unitsPos) + " " + filesizeString.substr(unitsPos);

			var itemType = "MorphoSource Record";
			var idString = formData.assets[index]._id.split("|").join("_");
			var thumbHTML = '<div class="popup-thumbnail-ms" id="assetThumb_' + idString + '"><img src="' + msFinalData[index].thumb + '" /></div>';

			var tableHTML = '<table class="table table-striped">';
			tableHTML += '<tr><td><strong>Media ID</td><td>' + msFinalData[index].media_id + ' <a href="https://www.morphosource.org/Detail/MediaDetail/Show/media_id/' + msFinalData[index].media_id + '" target="_blank">MorphoSource Website <i class="fas fa-external-link-alt"></i></a></td></tr>';
			tableHTML += '<tr><td><strong>Media File ID</td><td>' + msFinalData[index].media.media_file_id + '</td></tr>';
			tableHTML += '<tr><td><strong>Title</td><td>' + msFinalData[index].media.title + '</td></tr>';
			tableHTML += '<tr><td><strong>Element</td><td>' + msFinalData[index].media.element + '</td></tr>';
			tableHTML += '<tr><td><strong>Side</td><td>' + msFinalData[index].media.side + '</td></tr>';
			tableHTML += '<tr><td><strong>Notes</td><td>' + msFinalData[index].media.notes + '</td></tr>';
			tableHTML += '<tr><td><strong>File Size</td><td>' + filesizeStringFinal + '</td></tr>';
			tableHTML += '<tr><td><strong>File Type</td><td>' + msFinalData[index].media.file_type + '</td></tr>';
			tableHTML += '<tr><td><strong>MIME Type</td><td>' + msFinalData[index].media.mimetype + '</td></tr>';
			tableHTML += '</table>';


		} else {

			var itemType = "Asset";
			// show canvas if TIFF file
			var fileUrl = 'uploads/' + sessionGUID + '/' + formData.assets[index].filename;
			var fileName = formData.assets[index].filename;
			var ext = fileName.substr(fileName.lastIndexOf('.') + 1);

			if (ext == "tiff" || ext == "tif") {
				var theId = formData.assets[index]._id;
				var dest = "#assetThumb_" + theId;
				//			loadTiff(fileUrl, dest);

				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" ><p align="center"><em>Currently unable to preview TIFF files.</em></p></div>';

			} else if (ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png" ) {
				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" style="background-image: url(\'uploads/' + sessionGUID + '/' + formData.assets[index].filename + '\')"></div>';
			}  else { 
				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" ><p align="center"><em>Sorry, no preview is available for this file type.</em></p></div>';		   
		    }
			
			if( wasabiUploadType == "batch" && searchType == "record" ) {
				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" ><p align="center"><em>Sorry, no preview is available for this file because it will not be uploaded.</em></p></div>';
			}

			var sizeStringSimple = $("span[data-dz-size]").eq(index).html().split("<strong>").join("").split("</strong>").join("");

			var tableHTML = '<table class="table table-striped">';
			tableHTML += '<tr><td><strong>File Name</td><td>' + formData.assets[index].filename + '</td></tr>';
			tableHTML += '<tr><td><strong>File Size</td><td>' + sizeStringSimple + '</td></tr>';
			tableHTML += '<tr><td><strong>Creator Name</strong></td><td>' + formData.assets[index].creatorName.creator + '</td></tr>';
			tableHTML += '<tr><td><strong>Title</strong></td><td>' + formData.assets[index].title + '</td></tr>';
			tableHTML += '<tr><td><strong>Date</strong></td><td>' + formData.assets[index].date + '</td></tr>';
			tableHTML += '<tr><td><strong>Keywords</strong></td><td>' + formData.assets[index].keywords + '</td></tr>';
			tableHTML += '<tr><td><strong>Special Credit Line</strong></td><td>' + formData.assets[index].credit + '</td></tr>';
			tableHTML += '<tr><td><strong>Special Usage Permissions</strong></td><td>' + formData.assets[index].usage + '</td></tr>';
			tableHTML += '</table>';
		}

		msgHTML = thumbHTML + tableHTML;

		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DEFAULT,
			title: '<h4>Details: ' + itemType + ' #' + parseInt(index + 1) + '</h4>',
			message: msgHTML,
			keyboard: false,
			backdrop: 'static',
			buttons: [{
				label: 'OK',
				cssClass: 'btn-default',
				action: function (dialogItself) {
					dialogItself.close();
				}
            }]
		});

		//		// show canvas if TIFF file
		//		var fileUrl = 'uploads/' + sessionGUID + '/' + formData.assets[index].filename;
		//		var fileName = formData.assets[index].filename;
		//		var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
		//
		//		if (ext == "tiff" || ext == "tif") {
		//			var theId = formData.assets[index]._id;
		//			var dest = "#assetThumb_" + theId;
		//			console.log(dest, fileUrl);
		//			// currently broken
		//			//			loadTiff(fileUrl, dest);
		//
		//			$(dest).html("<p align='center'>Unable to preview TIFF files currently.</p>");
		//		}

	}

	function checkFreeSpace(filesize) {
		$.ajax({
			type: 'POST',
			url: 'diskspace.php',
			dataType: 'text',
//			data: 'filesize=' + 0,
			data: null,
			success: function (result) {
				// check result object for what you returned
				
				var response = result.split("|");
				// status | available | total | percent | cutoff
				
				if( response[0] == "ok") {
					console.log("disk space check:\nstatus | available | total | % available | % needed");
					console.log(response.join(" | "));
				} else {
					if( CASuser.name == "gjw22" ) {
						showPleaseWaitDialog(response);
					}
				}
				
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// check error object or return error
				showFinalErrorDialog("<p>" + textStatus + "</p><p>" + errorThrown + "</p>");
				console.warn(jqXHR, textStatus, errorThrown);
			}
		});
	}
	
	function makeFilesClickable() {

		if (wasabiUploadType == "morphosource") {

			$(".mimic-dz-thumb.green-border").removeClass("green-border").addClass("red-border");
			$(".mimic-dz-thumb.green-border-selected").removeClass("green-border-selected").addClass("red-border");

			$("#enterMetadataMessageContainer").fadeOut();

			if ($(".ms-file-selected").length) {
				$(".mimic-dz-thumb").click(function () {
					console.log($(this));
					activateMetadata($(this));
				});

				$(".ms-file-selected-target").each(function () {
					//build final data
					var mediaFileId = $(this).attr("data-media-file");
					var mediaId = $(this).attr("data-media-id");



					var mediaObj = _.findLast(msData, function (d) {
						return d['media_id'] == mediaId;
					});


					var mediaFileObj = _.findLast(mediaObj['media_files'], function (dd) {
						return dd['media_file_id'] == mediaFileId;
					});

					var obj = {
						"media": mediaFileObj,
						"thumb": $(this).attr("data-thumbnail"),
						"media_file_id": mediaFileId,
						"media_id": mediaId
					}

					msFinalData.push(obj);

					$(this).find(".mimic-dz-thumb").removeClass("dz-success");
					creatorNames.push({
						creator: "",
						irn: ""
					});

				})

				//initialize first morphosource selection
				setTimeout(function () {
					activateMetadata($(".ms-file-selected-target").eq(0));
				}, 1000);
			}

		} else {
			_.forEach(myDropzone.files, function (f) {
				f.previewElement.classList.remove("dz-success");
				creatorNames.push({
					creator: "",
					irn: ""
				});
			});

			$("a.dz-remove").slideUp();
			$("#dropzoneArea").css("cursor", "auto");
			$("#enterMetadataMessageContainer").fadeOut();
			_.forEach(myDropzone.files, function (file) {
				$(file.previewElement)
					.children(".dz-image")
					.addClass("red-border");

				file.previewElement.addEventListener("click", function () {
					activateMetadata(file);
				});
			});

			if (myDropzone.files.length > 1) {
				$(".metadataButtonNext")
					.prop("disabled", false)
					.removeClass("btn-disabled")
					.addClass("btn-default");
			}

			// initialize first upload
			activateMetadata(myDropzone.files[0]);
		}
	}

	function activateMetadata(file) {

		if (wasabiUploadType == "morphosource") {
		
			var asset = _.findLast(formData.assets, function (a) {
				return a._id == file.attr('data-media-id') + "|" + file.attr('data-media-file');
			});
			console.log("morphosource asset", asset);


		} else {

			var asset = _.find(formData.assets, function (a) {
				return a._id == file.upload.uuid;
			});
			console.log("dropzone asset: ", asset);
		}

		var num = formData.assets.indexOf(asset);


		if (wasabiUploadType == "morphosource") {
		
			var upload = $(".ms-file-selected-target").eq(num);
			console.log(upload)
			var uploadElement = $(".ms-file-selected-target").eq(num);
			var uploadElementContainer = $(".ms-file-selected-target").eq(num);
		} else {

			var upload = myDropzone.files[num];
			console.log(upload)
			var uploadElement = $(upload.previewElement).children(".dz-image");
			var uploadElementContainer = $(upload.previewElement).children(".dz-details");

		}

		uploadElementContainer.removeClass("no-clicky").addClass("clicky");

		// check if its place in line is valid
		if (num == 0 || formData.assets[num - 1].valid) {

			if (activeAsset != num) {

				if (activeAsset == -1) {
					activeAsset = 0;
				}

				activeAsset = num;

				//reset halos
				$(".red-border-selected").removeClass("red-border-selected").addClass("red-border");
				$(".green-border-selected").removeClass("green-border-selected").addClass("green-border");

				// add halo
				if (asset.valid) {
					uploadElement.removeClass("green-border").addClass("green-border-selected");
				} else {
					uploadElement.removeClass("red-border").addClass("red-border-selected");
				}

				$("#metadataNumber").text(
					num + 1 + " of " + formData.assets.length
				);
				$("#currentMetadataItem").html(asset.filename);

				if (asset.valid || (!asset.valid && num == 0)) {
					// preload with data from formData if asset is valid or it's the first time around

					$("#uploadsInfoCommonCreator").val(asset.creatorName.creator);

					$("#uploadsInfoCommonTitle").val(asset.title);
					$("#uploadsInfoCommonDate").val(asset.date);
					$("#uploadsInfoCommonKeywords").val(asset.keywords);
					$("#uploadsInfoCommonSpecialCreditLine").val(asset.credit);
					$("#uploadsInfoCommonSpecialUsage").val(asset.usage);
					$("#mainForm").validator("validate");
				} else {
					// keep previous asset's data
				}
			} else {
				// alert("you're already there!");
			}
		} else {
			// alert("not so fast");

		}
	}

	$("#mainForm").validator()
		.on("submit", function (e) {
			if (e.isDefaultPrevented()) {
				// handle the invalid form...
				//                alert("this is invalid");
				console.warn("invalid form submission");
			} else {
				// everything looks good!
				e.preventDefault();
				//                console.log("ready to set data.");

				if (wasabiUploadType == "morphosource") {
				
					var upload = $(".ms-file-selected-target").eq(activeAsset);
					var uploadElement = $(".ms-file-selected-target").eq(activeAsset);
				} else {
					var upload = myDropzone.files[activeAsset];
					var uploadElement = $(upload.previewElement).children(".dz-image");
				}


				//                console.log(upload);
				//                console.log(uploadElement);

				if (uploadElement.hasClass("red-border-selected")) {
					uploadElement.removeClass("red-border-selected").addClass("green-border-selected");
				}
				$("red-border-selected").not(uploadElement).removeClass("red-border-selected").addClass("red-border");
				$("green-border-selected").not(uploadElement).removeClass("green-border-selected").addClass("green-border");


				// set current item as valid
				formData.assets[activeAsset].valid = true;
				updateAssetData(activeAsset);



				if (_.every(formData.assets, "valid")) {
					console.warn("All assets' metadata are valid!\nReady to submit.");

					$("#finalSummaryContainer").show();
					$("#finalSubmitButtonContainer").show();
					$("#goToSubmitButtonContainer").slideDown();

				} else {
					console.warn("Incomplete: " + _.filter(formData.assets, function (a) {
						return !a.valid;
					}).length + "/" + formData.assets.length + " assets remaining.");
				}
			}
		});

	$("#finalSubmitButton").click(function () {
		//		alert("submitted!");
		//		$("#mainForm").submit();
		// send JSON to the server
		// write manifest file
		// write lockfile

		
		var dataSanitized = JSON.stringify(formData);
		dataSanitized = encodeURIComponent(dataSanitized);
		
		if( searchType == "record" ) {
			if( wasabiUploadType == "standard" ) {
				showFinalProcessingDialog();
				setTimeout(function() { goFinalize(dataSanitized);},300);
			} else if( wasabiUploadType == "morphosource") {
				// do nothing
				console.log('no processing dialog - morphosource');
				setTimeout(function() { goFinalize(dataSanitized);},300);
			} else if( wasabiUploadType == "batch" ) {
				// do nothing
				console.log('no processing dialog - batch');
				setTimeout(function() { goFinalize(dataSanitized);},300);
			} else {
				// i dunno
				showFinalProcessingDialog();
				setTimeout(function() { goFinalize(dataSanitized);},300);
			}
		} else if( searchType == "graphics" ) {
			showFinalProcessingDialog();
				setTimeout(function() { goFinalize(dataSanitized);},300);
		} else if( searchType == "event" ) {
			showFinalProcessingDialog();
				setTimeout(function() { goFinalize(dataSanitized);},300);
		} else {
			showFinalProcessingDialog();
				setTimeout(function() { goFinalize(dataSanitized);},300);
		}
		

	});

	function goFinalize(dataSanitized) {
		var theFile = formData.assets[0].filename;
		if( !formData.target )  { 
			var theCatalogNum = ""; 
		} else { 
			var theCatalogNum = formData.target.number; 
		}
		
		var newFileName = theFile + '--' + theCatalogNum.split('.').join('-') +'.json';
		$.ajax({
			type: 'POST',
			url: 'finalize.php',
			async: false,
			dataType: 'text',
			data: 'data=' + dataSanitized + '&folderName=' + sessionGUID + "&type=" + searchType + '&wasabiUploadType=' + wasabiUploadType,
			success: function (result) {
				// check result object for what you returned
//				showFinalSuccessDialog(result);
//				alert(wasabiUploadType + "|" + searchType)
				if( wasabiUploadType == "batch" && searchType == "record") {
					var theMessage = 'Thanks for your submission.  Your browser will now attempt to download a metadata file called:<br /><strong>' + newFileName + '</strong><br /><br />Please save this file on your computer <strong>in the same folder as the asset(s) you have just ingested</strong>.  You will use a third-party tool to submit the actual file(s) with this metadata file.';
					theMessage += '<br /><br />If your file did not download automatically, <strong><a href="'+ result +'" target="_blank">click here</a></strong> and save the .json file manually using the default filename mentioned above.'
					downloadBatchMetaFile(JSON.stringify(formData),newFileName);
					showFinalSuccessDialog(theMessage);
				} else if( wasabiUploadType == "morphosource" && searchType == "record" ) {
					var theMessage = 'Your submission was successful. Please allow time for these assets to propagate throughout the necessary systems.';
						theMessage += '<br /><br />Since this session targets MorphoSource, no files have been uploaded</strong>.  After you recieve final upload confirmation, please verify its success in the necessary locations.';
					showFinalSuccessDialog(theMessage);
				} else {
					showFinalSuccessDialog();
				}
				console.log(result);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// check error object or return error
				showFinalErrorDialog("<p>" + textStatus + "</p><p>" + errorThrown + "</p>");
				console.warn(jqXHR, textStatus, errorThrown);
			}
		});
	}

	function downloadBatchMetaFile(data, fileName, type="text/plain") {
	  // Create an invisible A element
	  downloadLinkBatchMetaFile = document.createElement("a");
	  downloadLinkBatchMetaFile.style.display = "none";
	  document.body.appendChild(downloadLinkBatchMetaFile);

	  // Set the HREF to a Blob representation of the data to be downloaded
	  downloadLinkBatchMetaFile.href = window.URL.createObjectURL(
		new Blob([data], { type })
	  );

	  // Use download attribute to set set desired file name
	  downloadLinkBatchMetaFile.setAttribute("download", fileName);

	  // Trigger the download by simulating click
	  downloadLinkBatchMetaFile.click();

	  // Cleanup -- NOT NEEDED
//	  window.URL.revokeObjectURL(downloadLinkBatchMetaFile.href);
//	  document.body.removeChild(downloadLinkBatchMetaFile);
	}

	
	function showNormalDialog(title,message) {
		if( !message || typeof(message) == "undefined") { var theText = "Hello!"; } else { var theText = message; }
		if( !title || typeof(title) == "undefined") { var theTitle = "Alert"; } else { var theTitle = title; }
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DEFAULT,
			closable: true,
			title: '<h4>'+theTitle+'</h4>',
			message: '<p>'+theText+'</p>',
			buttons: [{
				label: '<i class="fas fa-times"></i>&nbsp;Close',
				cssClass: 'btn-default',
				action: function (dialogItself) {
					dialogItself.close();
				}
            }]
		});
	}
	
	function showFinalProcessingDialog() {
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DEFAULT,
			closable: false,
			title: '<h4>SUBMITTING ASSETS</h4>',
			message: '<p>Please wait while your assets are being processed.  For very large files, this process may take several minutes.</p><p style="text-align: center" align="center"><img src="img/loader3.gif" /></p>'
		});
	}
	
	function showFinalErrorDialog(errText) {
		console.log(errText);
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DANGER,
			closable: false,
			title: '<h4>Error!</h4>',
			message: '<p>' + errText + '</p>',
			buttons: [{
				label: '<i class="fas fa-times"></i>&nbsp;Close',
				cssClass: 'btn-danger',
				action: function (dialogItself) {
					dialogItself.close();
				}
            }]
		});
	}

	function showFinalSuccessDialog(result) {
		if( !result ) {
			var theMessage = 'Your submission was successful. Please allow time for these assets to propagate throughout the necessary systems.';
		} else {
			var theMessage = result;
		}
//		console.log(result);
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_SUCCESS,
			closable: false,
			title: '<h4>Success!</h4>',
			message: '<p>' + theMessage + '</p>',
			buttons: [{
				label: '<i class="fas fa-sync-alt"></i>&nbsp;Start over',
				cssClass: 'btn-default',
				action: function () {
					document.location.reload();
				}
            }]
		});
	}

	function showPleaseWaitDialog(result) {
		console.log(result);
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_WARNING,
			closable: false,
			title: '<h4>Please Wait</h4>',
			message: '<p>Sorry, the server is currently over capacity and processing a large volume of assets.  Please wait a few minutes before trying to use this application again.</p>',
			buttons: [{
				label: '<i class="fas fa-sync-alt"></i>&nbsp;Reload',
				cssClass: 'btn-warning',
				action: function () {
					document.location.reload();
				}
            }]
		});
	}
	
	


	$("#searchEventAll").on("keyup keypress click", function (e) {
		searchTextEvent = $(this).val();
		//		console.log(searchTextEvent);
	});

	$("#searchRecordAll").on("keyup keypress click", function (e) {
		searchTextRecord = $(this).val();
		//		console.log(searchTextEvent);
	});

	function makeUserLink(user) {
		console.log(user);
		$("#userName").text(user.name);
		$("#userName").attr("title", user.type);
		$(".login").fadeIn();
	}

	function detectUser() {
		//CASuser.name = getQs("cas");
		CASuser.name = cookieCasUser;

		var noUser = "default";

		var userName = "";

		var recordBasedUsers = jsonDataUsers.scope.records;
		var eventBasedUsers = jsonDataUsers.scope.events;
		var bothBasedUsers = jsonDataUsers.scope.both;
		console.log("record-based users: ", recordBasedUsers);
		console.log("event-based users: ", eventBasedUsers);
		console.log("both event- and record-based users: ", bothBasedUsers);

		if (!CASuser.name || CASuser.name == "") {
			// no user name passed in via query string
			CASuser.name = noUser;

			if (_.includes(recordBasedUsers, noUser)) {
				//check for record-based
				console.warn("logged in as record-based user " + noUser);
				CASuser.type = "record";
				CASuser.type = "record";
				initialSearchType = "graphics";
				searchType = "record";
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, noUser)) {
					console.warn("logged in as event-based user " + noUser);
					CASuser.type = "event";
					initialSearchType = "graphics";
					searchType = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, noUser)) {
						console.warn(
							"logged in as both event- and record-based user " +
							noUser
						);
						CASuser.type = "both";
						initialSearchType = "graphics";
						searchType = "event";
						setTimeout(function () {
							showDebugPanel();
						}, 1000);
					} else {
						//default
						console.warn("logged in as basic graphics-based user " + noUser);
						CASuser.type = "graphics";
						initialSearchType = "graphics";
						searchType = "graphics";
					}
				}
			}

			userName = noUser;
			if (userName && userName != "null") {
				setQs("cas", userName);
			} else {
				stripQs("cas");
				location.reload();
			}
		} else {
			if (_.includes(recordBasedUsers, CASuser.name)) {
				//check for record-based
				console.warn("logged in as record-based user " + CASuser.name);
				CASuser.type = "record";
				CASuser.type = "record";
				initialSearchType = "graphics";
				searchType = "record";
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, CASuser.name)) {
					console.warn(
						"logged in as event-based user " + CASuser.name
					);
					CASuser.type = "event";
					initialSearchType = "graphics";
					searchType = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, CASuser.name)) {
						console.warn(
							"logged in as both event- and record-based user " +
							CASuser.name
						);
						CASuser.type = "both";
						initialSearchType = "graphics";
						searchType = "event";
						setTimeout(function () {
							showDebugPanel();
						}, 1000);
					} else {
						//default
						console.warn(
							"logged in as basic graphics-based user " + CASuser.name
						);
						CASuser.type = "graphics";
						initialSearchType = "graphics";
						searchType = "graphics";
					}
				}
			}
			userName = CASuser.name;
		}

		makeUserLink(CASuser);
		makeLookupSwitcher();

		setFormData("user", CASuser.name);

		sessionGUID = makeGUID();
		setFormData("guid", sessionGUID);
		printFormData();






		//focus search pane initially
		if (searchType == "event") {
			$("#searchEventAll").focus();
		} else if (searchType == "record") {
			$("#searchRecordAll").focus();
		} else if (searchType == "graphics") {
			$("#labelForSally").focus();
		}
	}

	
	$("#recordStepOneNextButton").click(function () {
		searchType = "record";
		setFormData("targetType","record");
		myDropzone.options.url = "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType;
//		alert(myDropzone.options.url);
	});
		
//	$("#eventStepOneNextButton").click(function () {
//		
//	});
	
	$("#graphicsStepOneNextButton").click(function () {
		var label = $("#labelForSally").val();
		var recipient = $("#graphicsRecipient").val();
		var dummyData = {
			"irn": "",
			"number": "",
			"date": {
				"start": "",
				"end": ""
			},
			"department": "",
			"description": "",
			"type": "",
			"concat": ""
		}
		searchType = "graphics";
		myDropzone.options.url = "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType;
//		alert(myDropzone.options.url);
		
		$("#morphoSourceApiResults").hide();
		$("#morphoSourceHeading").hide();
		$("#dropzoneArea").show();
		$("#dropzoneHeading").show();

		printSearchResults(dummyData, "graphics");
		setFormData("targetType", "graphics");
		searchType = "graphics";
		setFormData("target", null);
		setFormData("label", label);
		setFormData("recipient",recipient);
		//		$("#dropzoneArea").show();
		showTabTwo();
	});
	


	function showDebugPanel() {
		$("#outputToggle").html('<i class="fas fa-caret-up"></i>');
		$("#output").css('opacity', 0)
			.slideDown('slow')
			.animate({
				opacity: 1
			}, {
				queue: false,
				duration: 'slow'
			});
		$("#outputToggle").fadeIn('slow');
	}

	function hideDebugPanel() {
		$("#outputToggle").html('<i class="fas fa-caret-down"></i>');
		$("#output").css('opacity', 1)
			.slideUp('slow')
			.animate({
				opacity: 0
			}, {
				queue: false,
				duration: 'slow'
			});
	}

	$("#outputToggle").click(function () {
		if ($("#output").is(":hidden")) {
			showDebugPanel();
		} else {
			hideDebugPanel();
		}
	});


	function makeLookupSwitcher() {

		if (CASuser.type == "event") {
			$("#tabcontrol12").show();
		}

		if (CASuser.type == "record") {
			$("#tabcontrol13").show();
		}

		if (CASuser.type == "both") {
			$("#tabcontrol12").show();
			$("#tabcontrol13").show();
		}

		
		$("#graphicsRecipient").change(function() {
			setFormData("recipient",$(this).val() );
		})

		$('.nav-pills a[href="#searchPaneGraphics"]').on("shown.bs.tab", function (e) {
			printFormData();
		});

		$('.nav-pills a[href="#searchPaneEvent"]').on("shown.bs.tab", function (e) {
			printFormData();
		});

		$('.nav-pills a[href="#searchPaneRecord"]').on("shown.bs.tab", function (e) {
			printFormData();
		});

		wasabiUploadType = $('label input[type=radio][name=wasabiUploadType]').val();
		$("#wasabiUploadTypeHelpText").html(wasabiUploadTypeHelpText[wasabiUploadType]);
		setFormData("wasabiUploadType", wasabiUploadType);
		printFormData();

		$('label input[type=radio][name=wasabiUploadType]').on("change",function() {
			wasabiUploadType = $(this).val();
			$("#wasabiUploadTypeHelpText").html(wasabiUploadTypeHelpText[wasabiUploadType]);
			
			if( wasabiUploadType == "standard" ) {
				$("#recordStepOneNextButton").html('Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i>');
			} else {
				$("#recordStepOneNextButton").html('Select Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i>');
			}
			
			myDropzone.options.url = "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType;
			
			setFormData("wasabiUploadType", wasabiUploadType);
			printFormData();
		});
		
		// make toggle switch for 'record' path options (step 1)
		$("#searchByRecordMorphoSource").bootstrapToggle({
			on: "Yes",
			off: "No"
		});

		$("#searchByRecordEmbargoed").bootstrapToggle({
			on: "Yes",
			off: "No",
			onstyle: "danger",
			offstyle: "success"
		});
		


		$("#searchByRecordEmbargoed").change(function () {
			isEmbargoed = $(this).prop("checked");
			setFormData("private", isEmbargoed);
			console.log("Embargoed/private data: " + isEmbargoed);
			printFormData();
		});

		

		// ========================================================================
		// ===================== LOOKUP - EVENTS ==================================
		// ========================================================================

		var optsEvents = {
			//			url: "data/ingester-metadata-netx.json?v=" + randomNumber(),
			url: "../data/ingester-metadata-netx.json?v=" + randomNumber(),

			//			getValue: "description",
			listLocation: function (el) {
				return el;
			},
			getValue: function (element) {
				return element.concat;
			},
			list: {
				maxNumberOfElements: 500,
				match: {
					enabled: true
				},
				sort: {
					enabled: true
				},
				onChooseEvent: function () {
					searchType = "event";
					var obj = $("#searchEventAll").getSelectedItemData();
					//					console.log(obj);
					$("#searchEventAll").val(searchTextEvent);

					if ($("#eventStepOneNextButton").hasClass("btn-disabled")) {
						$("#eventStepOneNextButton").prop("disabled", false);
						$("#eventStepOneNextButton")
							.removeClass("btn-disabled")
							.addClass("btn-primary");
						//						$("#eventStepOneNextButton").trigger("click");

						$("#morphoSourceApiResults").hide();
						$("#morphoSourceHeading").hide();
						$("#dropzoneArea").show();
						$("#dropzoneHeading").show();
						showTabTwo();

						$("#eventStepOneNextButton").click(function () {
							searchType = "event";
							setFormData("morphosource", null);
							setFormData("private", null);
							printFormData();

							$("#morphoSourceApiResults").hide();
							$("#morphoSourceHeading").hide();
							$("#dropzoneArea").show();
							$("#dropzoneHeading").show();


							showTabTwo();
						});
					}

					printSearchResults(obj, "event");
					setFormData("target", obj);
					setFormData("label", null);
					setFormData("targetType", "event");
					
					myDropzone.options.url = "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType;
//					alert(myDropzone.options.url);
					
				},
				onShowListEvent: function () {
					creatorNameListOpen = true;
				},
				onHideListEvent: function () {
					creatorNameListOpen = false;
				}


			},
			template: {
				type: "custom",
				method: function (value, item) {

					var valArr = value.split("|");
					var html = "";

					html +=
						"<span class='result-line'><em>" +
						valArr[5] +
						"</em></span>";
					html +=
						"<span class='result-line smaller space-top'>" +
						valArr[2] +
						"&nbsp;&bull;&nbsp;" +
						valArr[3] +
						"</span>";
					html +=
						"<span class='result-line smaller'>" +
						valArr[4] +
						"</span>";
					html +=
						"<span class='result-line smaller'>IRN&nbsp;" +
						valArr[0] +
						"&nbsp;&bull;&nbsp;" +
						valArr[1] +
						"</span>";

					return html;
				}
			},
			//			theme: "blue-light"
			theme: "bootstrap"
		};

		var optsRecords = {
			url: "../data/ingester-metadata-specimens.json?v=" + randomNumber(),

			//			getValue: "description",
			listLocation: function (el) {
				return el;
			},
			getValue: function (element) {
				return element.concat;
			},
			list: {
				maxNumberOfElements: 500,
				match: {
					enabled: true
				},
				sort: {
					enabled: true
				},
				onChooseEvent: function () {
					searchType = "record";
					var obj = $("#searchRecordAll").getSelectedItemData();
					$("#searchRecordAll").val(searchTextRecord);

					if ($("#recordStepOneNextButton").hasClass("btn-disabled")) {
						$("#recordStepOneNextButton").prop("disabled", false);
						$("#recordStepOneNextButton")
							.removeClass("btn-disabled")
							.addClass("btn-primary");
						// showTabTwo();
						// don't automatically go to step 2 for 'record'

						$("#recordStepOneNextButton").click(function () {
							searchType = "record";
							printFormData();
							$("#dropzoneHelpText").html(dropzoneHelpText[wasabiUploadType]);
							if( wasabiUploadType != "morphosource") {
								$("#dropzoneHelpText").show();
							} else {
								$("#dropzoneHelpText").show();
							}
							
							showTabTwo();
						});

						
						if (wasabiUploadType == "morphosource") {
							$("#morphoSourceApiResults").show();
							$("#morphoSourceHeading").show();
							$("#dropzoneArea").hide();
							$("#dropzoneHeading").hide();
						} else {
							$("#dropzoneHeading").show();
							$("#dropzoneArea").show();
							$("#morphoSourceHeading").hide();
							$("#morphoSourceApiResults").hide();
						}
					}


					setFormData("private", isEmbargoed);


					printSearchResults(obj, "record");
//					printWasabiQuery(obj, "record");
					setFormData("target", obj);
					setFormData("label", null);
					setFormData("targetType", "record");
					
					myDropzone.options.url = "upload.php?folderName=" + sessionGUID + "&type=" + searchType + "&wasabiUploadType=" + wasabiUploadType;
					
				}
			},
			template: {
				type: "custom",
				method: function (value, item) {

					var valArr = value.split("|");
					var html = "";
					var finderDateSeparator;

					if (valArr[4] == "" || valArr[5] == "") {
						finderDateSeparator = "";
					} else {
						finderDateSeparator = "&nbsp;&bull;&nbsp;";
					}

					html +=
						"<span class='result-line'>" +
						valArr[1] +
						"</span>";

					html +=
						"<span class='result-line'>" +
						"<em>" +
						valArr[2] +
						"</em>";
					html +=
						"<span class='result-line smaller space-top'>" +
						valArr[4] +
						finderDateSeparator +
						valArr[5] +
						"</span>";
					html +=
						"<span class='result-line smaller'>" +
						valArr[3] +
						"</span>";
					html +=
						"<span class='result-line smaller'>IRN&nbsp;" +
						valArr[0] +
						"</span>";

					return html;
				}
			},
			theme: "bootstrap"
		};

		$("#searchEventAll").easyAutocomplete(optsEvents);
		$("#searchRecordAll").easyAutocomplete(optsRecords);
	}

	function showTabOne() {
		$('.nav-tabs a[href="#tab1"]').tab("show");
	}

	function showTabTwo() {
		$('.nav-tabs a[href="#tab2"]').tab("show");


	}

	function showTabThree() {
		$('.nav-tabs a[href="#tab3"]').tab("show");
	}

	function updateAssetData(target) {

		var asset = formData.assets[target];

		// set formData values

		// if user hasn't selected a valid autocomplete entry, set creatorName object as <inputVal>|"new"
		if (creatorName.creator == "" && creatorName.irn == "") {
			//			alert("This is a custom person!")
			creatorName.creator = $("#uploadsInfoCommonCreator").val();
			creatorName.irn = "new";
		}

		asset.creatorName.creator = creatorName.creator;
		asset.creatorName.irn = creatorName.irn;
		asset.date = $("#uploadsInfoCommonDate").val();

		asset.title = $("#uploadsInfoCommonTitle").val();
		asset.keywords = $("#uploadsInfoCommonKeywords").val();
		asset.credit = $("#uploadsInfoCommonSpecialCreditLine").val();
		asset.usage = $("#uploadsInfoCommonSpecialUsage").val();

		if (wasabiUploadType == "morphosource") {
			$(".ms-file-selected-target").eq(target).addClass("dz-success");
			setTimeout(function () {
				$(".ms-file-selected-target").eq(target).removeClass("dz-success");
				//            console.log("css reset | " + target )
			}, 3000);
		} else {
			myDropzone.files[target].previewElement.classList.add("dz-success");
			setTimeout(function () {
				myDropzone.files[target].previewElement.classList.remove("dz-success");
				//            console.log("css reset | " + target )
			}, 3000);
		}

		printFormData();

		if (target != formData.assets.length - 1) {
			//advance
			if (wasabiUploadType == "morphosource") {
				activateMetadata($(".ms-file-selected-target").eq(parseInt(target + 1)));
			} else {
				activateMetadata(myDropzone.files[parseInt(target + 1)]);
			}
		}

		// reset creator object after selection.
		// if user selects from autoComplete, it sets this object with selection
		// if user types and doesn't select, creatorName will be defined with logic above
		creatorName.creator = "";
		creatorName.irn = "";

	}

	function buildMorphosourceFinal() {
		$(".ms-file-selected-target").each(function () {

			var item_media_id = $(this).attr("data-media-id");
			var item_media_file = $(this).attr("data-media-file");

			var targetMedia = _.findLast(msData, function (o) {
				return o['media_id'] == item_media_id;
			});

			var obj = _.findLast(targetMedia['media_files'], function (n) {
				return n['media_file_id'] == item_media_file;
			});

			var package = {
				media_id: item_media_id,
				media_file: obj,
				id: item_media_id + "|" + item_media_file
			};
			setFormData("assets", package);
			printFormData();
		});
	}



	function addMorphosourceAsset(item_media_id, item_media_file) {
		console.log('adding asset: ' + item_media_id + " | " + item_media_file);

		var targetMedia = _.findLast(msData, function (o) {
			return o['media_id'] == item_media_id;
		});
		//		console.warn("targetMedia:", targetMedia)

		var obj = _.findLast(targetMedia['media_files'], function (n) {
			return n['media_file_id'] == item_media_file;
		});
		//		console.warn("obj:", obj)

		var package = {
			media_id: item_media_id,
			media_file: obj,
			id: item_media_id + "|" + item_media_file
		};

		//		alert(formData.assets.length);
	}


	function removeMorphosourceAsset(item_media_id, item_media_file) {
		console.log('removing asset: ' + item_media_id + " | " + item_media_file);

		_.remove(formData.assets, function (o) {
			return o.media_id == item_media_id && o.media_file['media_file_id'] == item_media_file;
		});
		printFormData();

		//		alert(formData.assets.length);

	}


	function setFormData(key, value) {
		//		console.log(key, value)
		if (!key && !value) {
			//generic form data set
			console.warn("bad function call");
		} else {
			if (!value && value !== false) {
				//				value = "not set";
				value = null;
			}

			// set specific key/value

			if (key == "assets") {
				var obj = {
					valid: false,

					creatorName: {
						creator: creatorName.creator,
						irn: creatorName.irn
					},

					title: $("#uploadsInfoCommonTitle").val(),
					date: $("#uploadsInfoCommonDate").val(),
					keywords: $("#uploadsInfoCommonKeywords").val(),
					credit: $("#uploadsInfoCommonSpecialCreditLine").val(),
					usage: $("#uploadsInfoCommonSpecialUsage").val(),
					//filename: value.name,
					filename: value.name.split(" ").join("_"),	// August 2023 fix - remove spaces from filenames
					filesize: value.size,
					filetype: value.type,
					media_id: value.media_id,
					media_file: value.media_file,
					_id: value.id,
					chunked: value.chunked
				};
//				if (formData.morphosource) {
				if (formData.wasabiUploadType == "morphosource") {
					formData[key].push(obj);
				} else {
					if (
						_.filter(formData.assets, function (o) {
							return (
								o.filename == value.name &&
								o.filesize == value.size &&
								o.filetype == value.type
							);
						}).length
					) {
						//					console.log("asset already exists.  skipping formData population")
					} else {
						formData[key].push(obj);
					}
				}
			} else {
				formData[key] = value;
			}
		}

		printFormData();
	}

	function printFormData() {
		$("#output").html(JSON.stringify(formData, null, 2));
	}

	// ===============================================================================
	// ======================== UPLOADS / COMMON METADATA ============================
	// ===============================================================================

	function clearForm() {
		$(".form-control").val("");
		$("#mainForm select").val($("#mainForm select option:first").val());
	}

	// initiate datepickers
	$("#uploadsInfoCommonDate").datepicker({
		dropupAuto: false,
		dateFormat: "yy-mm-dd",
		onSelect: function (dateText, inst) {
			$("#mainForm").validator("validate");
			//				console.warn(inst)
			//				searchByEventDateStart(inst);
		}
	});

	// ============================================================================

	// dynamic DOM elements workaround
	$("body").click(function (event) {
		//		if ($(event.target).is("#eventEditSearchLink")) {
		if ($(event.target).hasClass("edit-event-search-link")) {
			$('.nav-tabs a[href="#tab1"]').tab("show");
			$("#searchEventAll").focus();
		} else if ($(event.target).hasClass("edit-search-link")) {
			$('.nav-tabs a[href="#tab1"]').tab("show");
		} else if ($(event.target).hasClass("edit-record-search-link")) {
			$('.nav-tabs a[href="#tab1"]').tab("show");
			$("#searchRecordAll").focus();
		} else if ($(event.target).hasClass("edit-graphics-search-link")) {
			$('.nav-tabs a[href="#tab1"]').tab("show");
			$("#labelForSally").focus();
		} else if ($(event.target).hasClass("mimic-dz-thumb")) {
			if (defaultMsClick) {
				var item = $(event.target);

				var item_media_id = $(item).attr('data-media-id');
				var item_media_file = $(item).attr('data-media-file');

				//			console.warn(item_media_id, item_media_file);


				var isAdded = $(".ms-file-selected-target[data-media-file='" + item_media_file + "'][data-media-id='" + item_media_id + "']");
				//				console.log(isAdded)

				if (isAdded.length) {
					$(item).removeClass('green-border-selected').removeClass('green-border').addClass('red-border');
					$(item).parent().removeClass("ms-file-selected");
					$(item).removeClass("ms-file-selected-target");
				} else {
					$('.green-border-selected').not(item).removeClass('green-border-selected').addClass('green-border');
					$(item).removeClass('red-border-selected').removeClass('red-border').addClass('green-border-selected');
					$(item).parent().addClass("ms-file-selected");
					$(item).addClass("ms-file-selected-target");
				}
				checkMorphoSourceSelected();
			}
		}


	});

	$('.nav-tabs a[href="#tab1"]').on("shown.bs.tab", function (e) {
		//e.target // newly activated tab
		//e.relatedTarget // previous active tab

		if (initialSearchType == "event") {
			$("#searchEventAll").focus();
		} else {
			$("#searchRecordAll").focus();
		}
	});

	$('.nav-tabs a[href="#tab2"]').on("shown.bs.tab", function (e) {

		if (searchType == "record" && wasabiUploadType == "morphosource") {
			$("#morphoSourceApiResults").show();
			$("#morphoSourceHeading").show();
			$("#dropzoneArea").hide();
			$("#dropzoneHeading").hide();
			getMorphoSourceResults(formData.target.number);
		} else {
			$("#morphoSourceApiResults").hide();
			$("#morphoSourceHeading").hide();
			$("#dropzoneArea").show();
			$("#dropzoneHeading").show();
		}
	});

	function fnError() {
		alert('error');
	}

	function success_fn(data) {
		console.log(data);
	}

	function checkMorphoSourceSelected() {
		if ($(".ms-file-selected").length) {
			$("#enterMetadataMessageMs").fadeIn();
			$("#metadataStartButton")
				.prop("disabled", false)
				.removeClass("disabled")
				.removeClass("btn-disabled")
				.addClass("btn-primary");
		} else {
			$("#enterMetadataMessageMs").fadeOut();
			$("#metadataStartButton")
				.prop("disabled", "disabled")
				.addClass("disabled")
				.removeClass("btn-primary")
				.addClass("btn-disabled");
		}



	}

	function getJSON(url, callback) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'json';
		
		xhr.onload = function() {
		
			var status = xhr.status;
			
			if (status == 200) {
				callback(null, xhr.response);
			} else {
				callback(status);
			}
		};
		
		xhr.send();
	}

	function getMorphoSourceResults(catalogNum) {
		//		alert(catalogNum);

		$("#morphoSourceApiResults").empty();
		$("#morphoSourceHeadingNum").empty();

		var cn = catalogNum.split(".");

		if (cn.length == 2) {

			var dept = cn[0].toLowerCase();
			var num = cn[1];
			var endpointBase = "https://www.morphosource.org/api/v1/find/media?q=catalog_number:";
			var endpoint = endpointBase + "ypm%20" + dept + "%20" + num;
			var q = "ypm+" + dept + "+" + num;
			console.log(endpoint);
			// alert(searchString);


			$.ajaxSetup({
				crossOrigin: true,
				proxy: "proxy_c.php"
			});

			// $.getJSON(endpoint, null, function (data) {
			getJSON(endpoint,  function(err, data) {
				var data_t = JSON.stringify(data);
				if (err != null) {
					console.error(err);
				} else {
					console.log(data);
					console.log(data_t);
				}

				msData = [];

				var dataStart = data_t.indexOf("{");
				console.log("starting curly bracket: Position " + dataStart);
				if (dataStart == 0 || typeof data === 'object') {
					jsonMorphoSourceResults = data_t;
				} else {
					jsonMorphoSourceResults = data.substr(dataStart);
				}

				jsonMorphoSourceResults = JSON.parse(jsonMorphoSourceResults);

				console.log(jsonMorphoSourceResults);

				if (jsonMorphoSourceResults.totalResults == 0) {
					$("#morphoSourceApiResults").html("No results found.  To edit your search, <a href='javascript:void(0)' class='edit-record-search-link'>click here</a>.");
				} else {
					$("#morphoSourceHeadingNum").html(" (" + jsonMorphoSourceResults.totalResults + ")");
					$("#morphoSourceApiResults").append("<div class='container-fluid' id='morphoSourceApiResultsRows'></div>");


					// get images from MorphoSource website

					_.forEach(jsonMorphoSourceResults.results, function (result, i) {

						msData.push({
							"media_id": result['medium.media_id'],
							"media_files": []
						});

						var numMediaFiles = result['medium.media'].length;
						var numMediaFilesSuffix = (numMediaFiles >= 2) ? "s" : "";

						var msUrl = "https://www.morphosource.org/Detail/MediaDetail/Show/media_id/" + result['medium.media_id'];

						$.get(msUrl, function (data) {
							var data = $(data);
							//do something

							var imgList = $(data).find("div.mediaDetailImage a img");
							msImageThumbs[i] = [];
							$(imgList).each(function (img) {
								msImageThumbs[i].push($(this).attr("src"));
							})

						}).done(function () {
							// alert("done")
							$(".msMediaRow").each(function (iiii, row) {
								// console.log(iiii)
								$(row).find(".msThumb").each(function (iii, item) {
									if (typeof msImageThumbs[iiii] != 'undefined') {
										$(item).attr("data-thumbnail", msImageThumbs[iiii][iii]);
										$(item).css("background-image", "url(" + msImageThumbs[iiii][iii] + ")");
									}
								})

							});
						});

						$("#morphoSourceApiResultsRows").append("<div class='row ms-files-extra'><h4><a href='" + msUrl + "' target='_blank'><i class='far fa-file-image'></i> M" + result['medium.media_id'] + "</a></h4></div> ");

						$("#morphoSourceApiResultsRows").append("<div class='row ms-files-extra'><strong>" + numMediaFiles + " Media file" + numMediaFilesSuffix + ":" + "</strong></div>");

						var resultRow = document.createElement("div");
						resultRow.className = "row msMediaRow msMediaRow-" + i;

						_.forEach(result['medium.media'], function (media, ii) {
							//							console.log(media);
							var msRecord = result['medium.media_id'];
							var msRecordObj = _.findLast(msData, function (o) {
								return o['media_id'] == msRecord
							});
							msRecordObj.media_files.push(media);

							var filesizeString = media['filesize'].replace('i', '');
							var unitsPos = filesizeString.indexOf(filesizeString.match(/[a-zA-Z]/));
							var filesizeStringFinal = "<strong>" + filesizeString.substr(0, unitsPos) + "</strong> " + filesizeString.substr(unitsPos);

							var filetype = media['file_type'];
							var title = media['title'];
							var element = media['element'];

							if (!filetype || filetype == "" || typeof filetype == 'undefined') {
								var filetypestring = "";
							} else {
								var filetypestring = "<span class='thumb-caption'>" + media['file_type'] + "</span><br />";
							}

							if (!title || title == "" || typeof title == 'undefined') {
								var titlestring = "";
							} else {
								var titlestring = "<span class='thumb-caption'>" + media['title'] + "</span><br />";
							}

							if (!element || element == "" || typeof element == 'undefined') {
								var elementstring = "";
							} else {
								var elementstring = "<span class='thumb-caption'>" + media['element'] + "</span><br />";
							}

							$(resultRow).append("<div class='mimic-dz-item'><div class='mimic-dz-thumb red-border msThumb msThumb-" + result['medium.media_id'] + "' data-media-id='" + msRecord + "' data-media-file='" + media['media_file_id'] + "' style='background-image:url()'>" + $("#tpl2 .dz-preview .dz-success-mark")[0].outerHTML + "<br /><span class='mimic-thumb-span'>" + filesizeStringFinal + "</span><br /><span><b class='extra-ms-info mimic-thumb-span'>M" + result['medium.media_id'] + "</b></span><br /><span class='mimic-thumb-span'><i class='fas fa-image'></i> " + media['media_file_id'] + "</span><br /><span class='smaller mimic-thumb-span'>" + media['mimetype'] + "</span></div><div class='thumb-captions'>" + titlestring + filetypestring + elementstring + "</div></div>");
						});

						$("#morphoSourceApiResultsRows").append(resultRow);

					});
				}

			});


		} else {
			alert("bad request.");
		}
	}

	function loadTiff(filename, dest) {
		// destination expressed as jquery selector
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'arraybuffer';
		xhr.open('GET', filename);
		xhr.onload = function (e) {
			var tiff = new Tiff({
				buffer: xhr.response
			});
			var width = tiff.width();
			var height = tiff.height();
			var canvas = tiff.toCanvas();
			if (canvas) {
				canvas.setAttribute('style', 'width:' + (width * 0.3) +
					'px; height: ' + (height * 0.3) + 'px');
				$(dest).append(canvas);
			}
		};
		xhr.send();
	}


});


function loadJsonAsVar(url) {
	var obj;
	$.ajax({
		url: url,
		dataType: "json",
		async: false,
		//			data: myData,
		success: function (data) {
			obj = data;
		}
	});
	return obj;
}

function activateAgentLookup() {
	var options = {

		url: "../data/ingester-metadata-people.json?v=" + randomNumber(),

		getValue: function (element) {
			//			return element.concat;
			return element.creator;
		},

		list: {
			maxNumberOfElements: 100,
			match: {
				enabled: true
			},
			sort: {
				enabled: true
			},
			onChooseEvent: function () {
				creatorChosen = true;
				var obj = $("#uploadsInfoCommonCreator").getSelectedItemData();
				console.log(obj, activeAsset);
				editCommonMetadata("creator", obj.irn + "|" + obj.creator);
				creatorNames[activeAsset].creator = obj.creator;
				creatorNames[activeAsset].irn = obj.irn;

				creatorName.creator = obj.creator;
				creatorName.irn = obj.irn;
			}
		},

		theme: "bootstrap"
	};

	$("#uploadsInfoCommonCreator").easyAutocomplete(options);
}

function editCommonMetadata(key, value) {
	console.warn(key + " | " + value);
}

function printWasabiQuery(obj, type) {
	
	var target = obj.irn;
	
	if( type == "graphics" ) {
		alert("this function is not available yet.");
		return false;
	} else if( type == "event" ) { 
		alert("this function is not available yet.");
		return false;
	} else if( type == "record" ) {
		var dest = $("#searchResultsRecord");
		console.log("Querying Wasabi assets using IRN " + target);
	}
	
	var wasabiDateStamp = jsonDataWasabi.timestamp;
	var wdsm = moment(wasabiDateStamp);
	var wdsmET = wdsm.tz('America/New_York').format('dddd, MMMM D, YYYY @ h:mm a z');  // ET
	
	var wasabiMatches = _.filter(jsonDataWasabi.asset_summary, function(o) { 
		return o.irn == target;
	})
//	console.warn( wasabiMatches.length );
//	console.warn( wasabiMatches );
	
	$("#wasabiMatches").remove();
	
	if( wasabiMatches.length ) {
		
		var match = wasabiMatches[0];
		var assets = match.assets;
		
		var count = assets.length;
		var countStr = count==1?"":"s";
		
		var wasabiMatchesHTML = '<div class="alert alert-danger" id="wasabiMatches">';
			wasabiMatchesHTML += '	<div class="row">';
			wasabiMatchesHTML += '		<div class="col col-xs-2 col-sm-1">';
			wasabiMatchesHTML += '			<h4 class="pulsate"><i class="fas fa-exclamation-triangle"></i></h4>';
			wasabiMatchesHTML += '		</div>';
			wasabiMatchesHTML += '		<div class="col col-xs-10 col-sm-11">';
			wasabiMatchesHTML += '			<h4>Warning: '+count+' asset'+countStr+' already in Wasabi**</h4>';
			wasabiMatchesHTML += '			<p><hr /></p>';
			var num = 1;
			var manifestAssets = [];
			_.forEach(assets,function(asset,index) {
				
				var filename = asset['asset_url'].substr(asset['asset_url'].lastIndexOf("/") + 1);
				var manifestFilename = asset['manifest_url'].substr(asset['manifest_url'].lastIndexOf("/") + 1);
				var ext = filename.substr(filename.lastIndexOf(".") + 1);
				
					var manifest = loadJsonAsVar(asset['manifest_url']);
//					console.log(manifest);
					_.forEach(manifest.assets, function(a,index2){ 
						var mdata = {
							morphosource: manifest.morphosource,
							datestamp: manifest.dateStamp,
							user: manifest.user
						};

						if( manifest.morphosource === true) {
//							mdata.filesize = a['media_file'].filesize;
							mdata.filesize = asset['asset_bytes'];
							mdata.filename = null;
							mdata['media_file_id'] = a['media_file']['media_file_id'];
							mdata.title = a['media_file'].title;
						} else {
							mdata.filename = a.filename;
							mdata.filesize = a.filesize;
							mdata['media_file_id'] = null;
							mdata.title = a.title;
						}
							
							manifestAssets[index] = mdata;
//							manifestAssets.push(mdata);
						
					});
					manifestAssets = _.uniqWith(manifestAssets,_.isEqual);
				
				if( ext == "zip" || ext == "tar" || ext == "rar" || ext == "7z" ) {
					var icon = '<i class="far fa-file-archive"></i>';
					var type = "Compressed archive";
				} else if ( ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png" || ext == "tif" || ext == "tiff" || ext == "bmp" || ext == "jpe" || ext == "dxf" || ext == "jp2") {
					var icon = '<i class="far fa-file-image"></i>';
					var type = "Image";
				} else if ( ext == "pdf" ) {
					var icon = '<i class="far fa-file-pdf"></i>';
					var type = "PDF document";
				} else if( ext == "doc" || ext == "txt" || ext == "docx" || ext == "rtf" ) {
					var icon = '<i class="far fa-file-image"></i>';
					var type = "Text file";
				} else if( ext == "xls" || ext == "xlsx" || ext == "csv") {
					var icon = '<i class="far fa-file-excel"></i>';
					var type = "Spreadsheet";
				} else {
					var icon = '<i class="far fa-file"></i>';
					var type = "Other";
				}
				
				wasabiMatchesHTML += '<div class="wasabiAssetContainer"><div class="container-fluid"><div class="row"><div class="col col-xs-2 col-sm-1"><h2 style="margin-top: 0"><br />'+icon+'</h2></div>';
				wasabiMatchesHTML += '<div class="col col-xs-10 col-sm-11"><p><h4 style="margin-top: 0"><a target="_blank" title="Download Wasabi File: '+filename+'" href="'+asset['asset_url']+'">'+filename+' <i class="fas fa-download"></i></a></h4></p>';
				wasabiMatchesHTML += '<p><table>';
				wasabiMatchesHTML += '<tr><td><strong>Type: </strong></td><td>'+type+'</td></tr>';
				wasabiMatchesHTML += '<tr><td><strong>Contents: </strong></td><td>'+manifestAssets[index]['title']+'</td></tr>';
				wasabiMatchesHTML += '<tr><td><strong>Filesize: </strong></td><td>'+formatBytes(manifestAssets[index]['filesize'])+'</td></tr>';
				wasabiMatchesHTML += '<tr><td><strong>Source: </strong></td><td>'+asset['asset_source']+'</td></tr>';
				
				if( manifestAssets[index].morphosource === true ) {
					wasabiMatchesHTML += '<tr><td><strong>Media File ID: </strong></td><td>'+manifestAssets[index]['media_file_id']+'</td></tr>';
				}
				
				var ds = manifestAssets[index]['datestamp'];
				var dsm = moment(ds);
				var dsmET = dsm.tz('America/New_York').format('dddd, MMMM D, YYYY @ h:mm a z');  // ET
				
				wasabiMatchesHTML += '<tr><td><strong>Uploaded: </strong></td><td>'+dsmET+' by ' + manifestAssets[index]['user']+ '</td></tr>';
				wasabiMatchesHTML += '<tr><td><strong>Permission: </strong></td><td>'+asset['asset_permission']+'</td></tr>';
				wasabiMatchesHTML += '<tr><td style="padding-right: 25px"><strong>MD5 Checksum: </strong></td><td>'+asset['asset_md5']+'</td></tr>';
				wasabiMatchesHTML += '<tr><td><strong>Manifest: </strong></td><td><a target="_blank" title="Manifest URL: IRN'+match.irn+'" href="'+asset['manifest_url']+'">'+manifestFilename+'</a></td></tr>';
				wasabiMatchesHTML += '</table></div></row></div></div><p><hr /></p>';
				
				num++;
			});
			wasabiMatchesHTML += '			<p class="smaller"><em><strong>**as of '+wdsmET+'</strong></em></p><br />';
			wasabiMatchesHTML += '		</div>';
			wasabiMatchesHTML += '	</div>';
			wasabiMatchesHTML += '</div>';

		$(dest).append(wasabiMatchesHTML);
	}
	
}


function printSearchResults(obj, type) {
	clearSearchResults(type);
	if (type == "event") {
		var tpl = document.querySelector("#tplEvent").innerHTML;
		var destFirst = $("#searchResultsEvent");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	} else if (type == "record") {
		var tpl = document.querySelector("#tplRecord").innerHTML;
		var destFirst = $("#searchResultsRecord");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	} else if (type == "graphics") {
		var tpl = $("#labelForSally").val();
		tpl += '<button class="btn btn-default pull-right edit-graphics-search-link" style="clear: both" type="button" id="graphicsEditSearchLink"><i class="fas fa-pencil-alt"></i>&nbsp;Edit Purpose/Project</button>';
		var destFirst = $("#searchResultsGraphics");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	}

	var tplEdit = tpl.replace("{{{description}}}", obj.description);
	tplEdit = tplEdit.replace("{{{type}}}", obj.type);
	tplEdit = tplEdit.replace("{{{name}}}", obj.name);
	tplEdit = tplEdit.replace("{{{date}}}", obj.date);
	tplEdit = tplEdit.replace("{{{geography}}}", obj.geography);
	tplEdit = tplEdit.replace("{{{department}}}", obj.department);
	tplEdit = tplEdit.replace("{{{collector}}}", obj.collector);
	tplEdit = tplEdit.replace("{{{irn}}}", obj.irn);
	tplEdit = tplEdit.replace("{{{number}}}", obj.number);

	$(destFirst).append(tplEdit);
	$(destSecond).append(tplEdit);
	$(destThird).append(tplEdit);
}

function clearSearchResults(type) {
	if (type == "event") {
		var destFirst = $("#searchResultsEvent");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	} else if (type == "record") {
		var destFirst = $("#searchResultsRecord");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	} else if (type == "graphics") {
		var destFirst = $("#searchResultsGraphics");
		var destSecond = $("#confirmedResultStepTwo");
		var destThird = $("#confirmedResultStepThree");
	}

	$(destFirst).empty();
	$(destSecond).empty();
	$(destThird).empty();
}

function getPageWidth() {
	$("#pageWidth").val($(window).width());
}

function formatBytes(a, b) {
	if (0 == a) return "0 Bytes";
	var c = 1024,
		d = b || 2,
		e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
		f = Math.floor(Math.log(a) / Math.log(c));
	return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
}

function createHexId(length) {
	var choices = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
    ];
	var hexString = "";
	for (var i = 0; i < length; i++) {
		hexString += _.sample(choices);
	}

	return hexString;
}

function getGUID() {

	$.ajax({
		url: 'getGUID.php',
		async: false,
		type: 'POST',
		dataType: 'json',
		success: function (result) {
			sessionGUID = result;
			console.warn("GUID returned: " + sessionGUID);
		},
		error: function () {
			console.error("error in fetching GUID.");
		}
	})

}


function makeGUID() {
	var choices = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
    ];
	var groups = [[], [], [], [], []];

	//group 1
	for (var i = 0; i < 8; i++) {
		groups[0].push(_.sample(choices));
	}
	groups[0] = groups[0].join("");

	//group 2
	for (var i = 0; i < 4; i++) {
		groups[1].push(_.sample(choices));
	}
	groups[1] = groups[1].join("");

	//group 3
	for (var i = 0; i < 4; i++) {
		groups[2].push(_.sample(choices));
	}
	groups[2] = groups[2].join("");

	//group 4
	for (var i = 0; i < 4; i++) {
		groups[3].push(_.sample(choices));
	}
	groups[3] = groups[3].join("");

	//group 5
	for (var i = 0; i < 12; i++) {
		groups[4].push(_.sample(choices));
	}
	groups[4] = groups[4].join("");

	return groups.join("-");
}

function syntaxHighlight(json) {
	json = json
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	return json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		function (match) {
			var cls = "number";
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = "key";
				} else {
					cls = "string";
				}
			} else if (/true|false/.test(match)) {
				cls = "boolean";
			} else if (/null/.test(match)) {
				cls = "null";
			}
			return '<span class="' + cls + '">' + match + "</span>";
		}
	);
}

function dallas() {
	var choices = [
        "cowboys",
        "stars",
        "mavericks",
        "fuel",
        "rattlers",
        "rayados",
        "roughnecks",
        "marshals",
        "mustangs",
        "desperados",
        "black hawks",
        "vigilantes",
        "texans"
    ];
	var str = _.sample(choices);
	return str;
}

function getQs(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setQs(param, value) {
	var url = window.location.href;
	var new_url = url + "?" + param + "=" + value;
	history.pushState(null, null, new_url);
}

function stripQs(parameter, url) {
	if (!url) url = window.location.href;
	//prefer to use l.search if you have a location/link object
	var urlparts = url.split("?");
	if (urlparts.length >= 2) {
		var prefix = encodeURIComponent(parameter) + "=";
		var pars = urlparts[1].split(/[&;]/g);

		//reverse iteration as may be destructive
		for (var i = pars.length; i-- > 0;) {
			//idiom for string.startsWith
			if (pars[i].lastIndexOf(prefix, 0) !== -1) {
				pars.splice(i, 1);
			}
		}

		url = urlparts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
		//		return url;
		return url;
	} else {
		return url;
	}
}

// ============================================================
// SEARCH BY EVENT
// ============================================================

function searchByEvent(obj) {
	var filterEvalArr = [];

	var filterEvalString = filterEvalArr.join(" && ");

	console.log(filterEvalString);

	var results = _.filter(jsonDataEvents, function (o) {
		return eval(filterEvalString);
	});

}

// ============================================================

function resetSelects() {
	// remove "selected" from any options that might already be selected
	$('select option[selected="selected"]').each(function () {
		$(this).removeAttr("selected");
	});
	// mark the first option as selected
	$("select option:first").attr("selected", "selected");
}

function randomNumber() {
	return Math.floor(Math.random() * 1000000000);
}

function feedbackEmail() {
	var v = $("#appVersion").text();
	window.open('mailto:peabody.webmaster@yale.edu?subject=Injestr issue: v' + v);
}

function safeFilename(val) {
	// MAY 2023       
	var filenameGroups = val.split(".");
	var regexp = /^[a-zA-Z0-9-_\ \.]+$/;
	var regexpext = /^[a-zA-Z0-9]+$/;

	var validTypes = jsonDataFileTypes.allowedFileTypes; //array
	console.log("valid filetypes:");
	console.log(validTypes);

	if( Array.isArray(filenameGroups) && filenameGroups.length == 2) {
		
		if( filenameGroups[1].length >= 1 && filenameGroups[1].search(regexpext) !== -1 ) {
			// JULY 2023
			// check if filename is in valid types dictionary
			var validFileType = false;
			_.forEach(validTypes,function(f){
				var isMatch = false;
				if( filenameGroups[1].toLowerCase() == f.toLowerCase()) {
					validFileType = true;
					isMatch = true;
				} else {
					isMatch = false;
				}
			});
			console.log("file type match: " + validFileType);

			if( filenameGroups[0].length >= 1 && filenameGroups[0].search(regexp) !== -1) {
				if( validFileType ) {
					console.log("VALID");
					return true;
				} else {
					console.log("ILLEGAL FILE TYPE");
					return false;
				}
			} else {
				console.log("INVALID FILENAME");
				return false;
			}
		} else {
			console.log("INVALID EXTENSION FORMAT");
			return false;
		}
	} else {
		console.log("INVALID FORMAT");
		return false;
	}
}