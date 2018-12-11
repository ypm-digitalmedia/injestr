var myDropzone = null;
var defaultMsClick = true;
var currentFile = null;

var formData = {
	targetType: null,
	label: null,
	target: null,
	dateStamp: null,
	guid: null,
	user: null,
	morphosource: false,
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

var jsonMorphoSourceResults = {};
var msImageThumbs = [];
var msPageResponses = [];
var msData = [];
var msFinalData = [];

var isMorphoSource = false;
var isEmbargoed = false;

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

	detectUser();
	getPageWidth();
	resetSelects();
	activateCreatorLookup();

	clearForm();

	$(window).resize(function () {
		getPageWidth();
	});

	myDropzone = new Dropzone("div#dropzoneArea", {
		//		acceptedFiles: 'image/*,application/pdf,.psd,text/*,.zip,.tar,.tar.gz,.7z,.tif,.tiff,application/msword,.html,.htm', //ex: image/*,application/pdf,.psd
		//		acceptedFiles: 'image/*',
		acceptedMimeTypes: null, //DEPRECATED
		autoProcessQueue: true, //if false, queue will not be processed automatically.
		//		addRemoveLinks: true, //add a link to every file preview to remove or cancel
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
		maxFilesize: 16000, // MB
//		maxFilesize: 1,
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
		//		url: "upload.php?folderName=" + sessionGUID + "&type=" + searchType,
		url: "upload.php?folderName=" + sessionGUID + "&type=" + searchType,
		//		url: "javascript:uploadFile()",
		withCredentials: false,

		//		accept: function (file, done) {
		//			if (file.name == "justinbieber.jpg") {
		//				done("Naha, you don't.");
		//			} else {
		//				done();
		//			}
		//		},

		uploadprogress: function (file, progress, bytesSent) {
			if (file.previewElement) {
				var progressElement = file.previewElement.querySelector(
					"[data-dz-uploadprogress]"
				);
				var progressTrunc = parseFloat(progress).toFixed(1);
				progressElement.style.width = progress + "%";
				progressElement.querySelector(".progress-text").textContent =
					progressTrunc + "%";
			}
		},
//		thumbnail: function(file, dataUrl){
////			console.log(file);
////			console.log(dataUrl);
//			
//			if( file.type.match(/image.jpeg/) || file.type.match(/image.gif/) || file.type.match(/image.png/) ) {
////				myDropzone.createThumbnailFromUrl(file, dataUrl, undefined, false);
//				myDropzone.createThumbnailFromUrl(
//					file,
//					dataUrl,
//					function(thumbnail) {
//						myDropzone.emit('thumbnail', file, thumbnail);
//						myDropzone.emit("complete", file);
//					},
//					true
//				);
//				
//			} else {
////				myDropzone.createThumbnailFromUrl(file, "img/file_icon.png",undefined, false);
//				myDropzone.createThumbnailFromUrl(
//					file,
//					"img/file_icon.png",
//					function(thumbnail) {
//						myDropzone.emit('thumbnail', file, thumbnail);
//						myDropzone.emit("complete", file);
//					},
//					true
//				);
//				
//			}
//			
//		},
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
						//						console.log(file.upload.filename + " already exists.  skipping...");
					} else {
						//						console.log(file.upload.filename + " (" + formatBytes(file.size) + ") added to queue.");

						setFormData("assets", package);
						//						console.log(file)
					}
				}
			}
			$("#metadataStartButton")
				.prop("disabled", false)
				.removeClass("disabled")
				.removeClass("btn-disabled")
				.addClass("btn-primary");
			//			$("#uploadsInfoCommon").fadeIn();
		} else {
			$("#metadataStartButton")
				.prop("disabled", "disabled")
				.addClass("disabled")
				.removeClass("btn-primary")
				.addClass("btn-disabled");
			//			$("#uploadsInfoCommon").fadeOut();
		}
	});

	myDropzone.on("complete", function (file) {
		//		console.log(file.upload.filename + " (" + formatBytes(file.size) + ") processed.");
		//		makeData(file);
	});

	$("#metadataStartButton").click(function () {
//----- BEGIN ACTUAL CODE -----

		if (isMorphoSource) {
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

		if (isMorphoSource) {
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

			if (isMorphoSource) {

				var filesizeString = formData.assets[index]['media_file']['filesize'].replace('i', '');
				var unitsPos = filesizeString.indexOf(filesizeString.match(/[a-zA-Z]/));
				//				var filesizeStringFinal = "<strong>" + filesizeString.substr(0, unitsPos) + "</strong> " + filesizeString.substr(unitsPos);
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
		if (isMorphoSource) {

			var filesizeString = msFinalData[index].media['filesize'].replace('i', '');
			var unitsPos = filesizeString.indexOf(filesizeString.match(/[a-zA-Z]/));
			//				var filesizeStringFinal = "<strong>" + filesizeString.substr(0, unitsPos) + "</strong> " + filesizeString.substr(unitsPos);
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
				//			console.log(dest, fileUrl);
				// currently broken
				//			loadTiff(fileUrl, dest);

				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" ><p align="center"><em>Currently unable to preview TIFF files.</em></p></div>';

			} else if (ext == "jpg" || ext == "jpeg" || ext == "gif" || ext == "png" ) {
				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" style="background-image: url(\'uploads/' + sessionGUID + '/' + formData.assets[index].filename + '\')"></div>';
			} else { 
				var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" ><p align="center"><em>Sorry, no preview available for this file type.</em></p></div>';		   
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


	function makeFilesClickable() {

		if (isMorphoSource) {

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

		if (isMorphoSource) {
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


		if (isMorphoSource) {
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

				if (isMorphoSource) {
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

		//		setFormData('datestamp', moment().toISOString());
		
		var dataSanitized = JSON.stringify(formData);
		dataSanitized = encodeURIComponent(dataSanitized);

		showFinalProcessingDialog();
		
		$.ajax({
			type: 'POST',
			url: 'finalize.php',
			dataType: 'text',
			//			data: 'data=' + JSON.stringify(formData),
			data: 'data=' + dataSanitized + '&folderName=' + sessionGUID + "&type=" + searchType,
			//			data: 'data=' + JSON.stringify(formData) + '&folderName=' + sessionGUID + "&type=" + searchType,
			success: function (result) {
				// check result object for what you returned
				showFinalSuccessDialog(result);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				// check error object or return error
				showFinalErrorDialog("<p>" + textStatus + "</p><p>" + errorThrown + "</p>");
				console.warn(jqXHR, textStatus, errorThrown);
			}
		});

//		showFinalSuccessDialog();
	})

	function showFinalProcessingDialog() {
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DEFAULT,
			closable: false,
			title: '<h4>SUBMITTING ASSETS</h4>',
			message: '<p>Please wait while your assets are being processed.  For very large files, this process may take several minutes.</p><p style="text-align: center" align="center"><img src="img/loader3.gif" /></p>',
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
		console.log(result);
		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_SUCCESS,
			closable: false,
			title: '<h4>Success!</h4>',
			message: '<p>Your submission was successful. Please allow time for these assets to propagate throughout the necessary systems.</p>',
			buttons: [{
				label: '<i class="fas fa-sync-alt"></i>&nbsp;Start over',
				cssClass: 'btn-default',
				action: function () {
					document.location.reload();
				}
            }]
		});
	}

	//	$("#logoutLink").click(function () {
	//		var newUrl = stripQs("cas");
	//		window.location.href = newUrl;
	//	});




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
			// var noUser = prompt("Enter your CAS username:");
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

		//		if (!userName || userName == "null") {
		//			alert("not logged in!");
		//			stripQs("cas");
		//			location.reload();
		//		} else {
		//			//all good, let's go
		//
		//			makeUserLink(CASuser);
		//			makeLookupSwitcher();
		//		}

		//		alert(CASuser);
		makeUserLink(CASuser);
		makeLookupSwitcher();

		//		setFormData("targetType", searchType);
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

	//	$("#labelForSally").on("keyup", function () {
	//		var label = $(this).val();
	//		console.warn(label);
	//		if (!label || label == "") {
	//			$("#graphicsStepOneNextButton").prop("disabled", "disabled");
	//			$("#graphicsStepOneNextButton")
	//				.removeClass("btn-primary")
	//				.addClass("btn-disabled");
	//			$("#graphicsStepOneNextButton").click(function () {
	//				void(0);
	//			});
	//			$("#dropzoneArea").hide();
	//		} else {
	//			$("#graphicsStepOneNextButton").prop("disabled", false);
	//			$("#graphicsStepOneNextButton")
	//				.removeClass("btn-disabled")
	//				.addClass("btn-primary");
	//
	//			var dummyData = {
	//				"irn": "",
	//				"number": "",
	//				"date": {
	//					"start": "",
	//					"end": ""
	//				},
	//				"department": "",
	//				"description": "",
	//				"type": "",
	//				"concat": ""
	//			}
	//
	//			$("#graphicsStepOneNextButton").click(function () {
	//				searchType = "graphics";
	//				printSearchResults(dummyData, "graphics");
	//				setFormData("targetType", "graphics");
	//				searchType = "graphics";
	//				setFormData("target", null);
	//				setFormData("label", label);
	//				showTabTwo();
	//			});
	//			$("#dropzoneArea").show();
	//		}
	//
	//	});




	$("#graphicsStepOneNextButton").click(function () {
		var label = $("#labelForSally").val();
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


		$("#morphoSourceApiResults").hide();
		$("#morphoSourceHeading").hide();
		$("#dropzoneArea").show();
		$("#dropzoneHeading").show();

		searchType = "graphics";
		printSearchResults(dummyData, "graphics");
		setFormData("targetType", "graphics");
		searchType = "graphics";
		setFormData("target", null);
		setFormData("label", label);
		//		$("#dropzoneArea").show();
		showTabTwo();
	});


	$('.nav-pills a[href="#searchPaneGraphics"]').on("shown.bs.tab", function (e) {
		isMorphoSource = false;
		setFormData("morphosource", false);
		printFormData();
	});

	$('.nav-pills a[href="#searchPaneEvent"]').on("shown.bs.tab", function (e) {
		isMorphoSource = false;
		setFormData("morphosource", false);
		printFormData();
	});

	$('.nav-pills a[href="#searchPaneRecord"]').on("shown.bs.tab", function (e) {
		isMorphoSource = $("#searchByRecordMorphoSource").prop("checked");
		setFormData("morphosource", $("#searchByRecordMorphoSource").prop("checked"));
		printFormData();
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




	//	$("#lookupToggle").change(function () {
	//		var status = $(this).prop("checked");
	//		var statusText = "";
	//		if (status === true) {
	//			statusText = "event";
	//			searchText = "event";
	//			setFormData("targetType", "event");
	//			$("#searchPaneRecord").hide();
	//			$("#searchPaneEvent").fadeIn();
	//		} else {
	//			statusText = "record";
	//			searchText = "record";
	//			setFormData("targetType", "record");
	//			$("#searchPaneEvent").hide();
	//			$("#searchPaneRecord").fadeIn();
	//		}
	//
	//		console.log("Toggle: " + status + " | " + statusText);
	//	});

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

		$("#searchByRecordMorphoSource").change(function () {
			isMorphoSource = $(this).prop("checked");

			setFormData("morphosource", isMorphoSource);
			console.log("MorphoSource record: " + isMorphoSource);

			if (isMorphoSource) {
				$("#recordStepOneNextButton").html('Select Media&nbsp;<i class="fas fa-arrow-alt-circle-right"></i>');
			} else {
				$("#recordStepOneNextButton").html('Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i>');
			}

			printFormData();
		});

		$("#searchByRecordEmbargoed").change(function () {
			isEmbargoed = $(this).prop("checked");
			setFormData("private", isEmbargoed);

			console.log("Embargoed/private data: " + isEmbargoed);

			printFormData();
		});

		// make toggle switch (first version) 
		//		if (CASuser.type == "event" || CASuser.type == "both") {
		//			$("#lookupToggle").prop("checked", true);
		//		} else {
		//			$("#lookupToggle").prop("checked", false);
		//		}

		//		if (CASuser.type == "event") {
		//			$("#searchByLabelEvent").show();
		//			$("#lookupToggle").hide();
		//		} else if (CASuser.type == "record") {
		//			$("#searchByLabelRecord").show();
		//			$("#searchPaneEvent").hide();
		//			$("#searchPaneRecord").show();
		//			$("#lookupToggle").hide();
		//		} else {
		//			$("#lookupToggle").bootstrapToggle({
		//				on: "Event",
		//				off: "Record",
		//				onstyle: "default",
		//				offstyle: "default"
		//			});
		//		}

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
					//					return value + "<br /><span class='smaller'>IRN " + item.irn + " &bull; " + item.number + "</span>";

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
			//			url: "data/ingester-metadata-netx.json?v=" + randomNumber(),
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
					//					console.log(obj);
					$("#searchRecordAll").val(searchTextRecord);

					if ($("#recordStepOneNextButton").hasClass("btn-disabled")) {
						$("#recordStepOneNextButton").prop("disabled", false);
						$("#recordStepOneNextButton")
							.removeClass("btn-disabled")
							.addClass("btn-primary");
						//						showTabTwo();
						// don't automatically go to step 2 for 'record'

						$("#recordStepOneNextButton").click(function () {
							searchType = "record";
							isMorphoSource = $("#searchByRecordMorphoSource").prop("checked");
							setFormData("morphosource", isMorphoSource);
							printFormData();
							showTabTwo();
						});

						//						alert("don't show dropzone if it's a morphosource record!  use the API lookup instead.\n\nPut new fields into manifest json (collector, geography, etc.)")
						if (isMorphoSource) {
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

					//					obj.private = isEmbargoed;
					//					obj.morphosource = isMorphoSource;

					setFormData("morphosource", isMorphoSource);
					setFormData("private", isEmbargoed);


					printSearchResults(obj, "record");
					setFormData("target", obj);
					setFormData("label", null);
					setFormData("targetType", "record");
				}
			},
			template: {
				type: "custom",
				method: function (value, item) {
					//					return value + "<br /><span class='smaller'>IRN " + item.irn + " &bull; " + item.number + "</span>";

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
			//			theme: "blue-light"
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
		//		asset.creatorName.last = $("#uploadsInfoCommonCreatorLast").val();
		//		asset.creatorName.first = $("#uploadsInfoCommonCreatorFirst").val();
		//		asset.creatorName.middle = $("#uploadsInfoCommonCreatorMiddle").val();

		// if user hasn't selected a valid autocomplete entry, set creatorName object as <inputVal>|"new"
		if (creatorName.creator == "" && creatorName.irn == "") {
			//			alert("This is a custom person!")
			creatorName.creator = $("#uploadsInfoCommonCreator").val();
			creatorName.irn = "new";
		}

		asset.creatorName.creator = creatorName.creator;
		asset.creatorName.irn = creatorName.irn;

		asset.title = $("#uploadsInfoCommonTitle").val();
		asset.date = $("#uploadsInfoCommonDate").val();
		asset.keywords = $("#uploadsInfoCommonKeywords").val();
		asset.credit = $("#uploadsInfoCommonSpecialCreditLine").val();
		asset.usage = $("#uploadsInfoCommonSpecialUsage").val();

		if (isMorphoSource) {
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
			if (isMorphoSource) {
				//				alert(parseInt(target + 1))
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
		//		setFormData("assets", package);
		//		printFormData();

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
					//					creatorName: {
					//						first: $("#uploadsInfoCommonCreatorFirst").val(),
					//						middle: $("#uploadsInfoCommonCreatorMiddle").val(),
					//						last: $("#uploadsInfoCommonCreatorLast").val()
					//					},
					creatorName: {
						creator: creatorName.creator,
						irn: creatorName.irn
					},

					title: $("#uploadsInfoCommonTitle").val(),
					date: $("#uploadsInfoCommonDate").val(),
					keywords: $("#uploadsInfoCommonKeywords").val(),
					credit: $("#uploadsInfoCommonSpecialCreditLine").val(),
					usage: $("#uploadsInfoCommonSpecialUsage").val(),
					filename: value.name,
					filesize: value.size,
					filetype: value.type,
					media_id: value.media_id,
					media_file: value.media_file,
					_id: value.id,
					chunked: value.chunked
				};
				if (formData.morphosource) {
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

	//	$("#uploadsInfoCommonKeywords").tagsInput({
	//		'height': '68px',
	//		'width': '100%',
	//		'interactive': true,
	//		'defaultText': "Enter keyword",
	//		'onAddTag': function () {
	//
	//			//			$("#mainForm").validator('validate');
	//		},
	//		'onRemoveTag': function () {},
	//		'onChange': function () {
	//			//			$("#mainForm").validator("validate");
	//			var tags = $(this).val();
	//			//			if (tags == "") {
	//			//				$("#mainForm").validator("validate", function () {
	//			//
	//			//					$("#uploadsInfoCommonKeywords").focus();
	//			//				});
	//			//			}
	//		},
	//		'delimiter': [',', ';', '|'], // Or a string with a single delimiter. Ex: ';'
	//		'removeWithBackspace': true,
	//		'minChars': 0,
	//		'maxChars': 0, // if not provided there is no limit
	//	});

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
				//			$(item).toggleClass('green-border-selected');
				//			$(".green-border-selected").removeClass("green-border-selected").addClass("green-border");

				var item_media_id = $(item).attr('data-media-id');
				var item_media_file = $(item).attr('data-media-file');

				//			console.warn(item_media_id, item_media_file);

				//				var isAdded = _.find(formData.assets, function (o) {
				//					return o.media_id == item_media_id && o.media_file.media_file_id == item_media_file;
				//				});

				var isAdded = $(".ms-file-selected-target[data-media-file='" + item_media_file + "'][data-media-id='" + item_media_id + "']");
				//				console.log(isAdded)

				if (isAdded.length) {
					//					removeMorphosourceAsset(item_media_id, item_media_file);
					$(item).removeClass('green-border-selected').removeClass('green-border').addClass('red-border');
					$(item).parent().removeClass("ms-file-selected");
					$(item).removeClass("ms-file-selected-target");
				} else {
					//					addMorphosourceAsset(item_media_id, item_media_file);
					$('.green-border-selected').not(item).removeClass('green-border-selected').addClass('green-border');
					$(item).removeClass('red-border-selected').removeClass('red-border').addClass('green-border-selected');
					$(item).parent().addClass("ms-file-selected");
					$(item).addClass("ms-file-selected-target");
				}
				checkMorphoSourceSelected();
			}
		}

		//		if ($(event.target).not(".eac-item") && creatorNameListOpen) {
		//			alert("you didn't pick anything");
		//		}

	});

	$('.nav-tabs a[href="#tab1"]').on("shown.bs.tab", function (e) {
		//e.target // newly activated tab
		//e.relatedTarget // previous active tab
		//		$("#searchEventAll").focus();

		if (initialSearchType == "event") {
			$("#searchEventAll").focus();
		} else {
			$("#searchRecordAll").focus();
		}
	});

	$('.nav-tabs a[href="#tab2"]').on("shown.bs.tab", function (e) {

		if (isMorphoSource && searchType == "record") {
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

	function getMorphoSourceResults(catalogNum) {
		//		alert(catalogNum);

		$("#morphoSourceApiResults").empty();
		$("#morphoSourceHeadingNum").empty();

		var cn = catalogNum.split(".");

		if (cn.length == 2) {

			var dept = cn[0].toLowerCase();
			var num = cn[1];
			var endpointBase = "https://www.morphosource.org/api/v1/find/media?q=catalog_number:";
			//			var endpoint = endpointBase + "ypm " + dept + " " + num;
			var endpoint = endpointBase + "ypm%20" + dept + "%20" + num;
			var q = "ypm+" + dept + "+" + num;
			console.log(endpoint);
			// alert(searchString);


			$.ajaxSetup({
				crossOrigin: true,
				proxy: "proxy.php"
			});
			$.getJSON(endpoint, null, function (data) {

				msData = [];

				var dataStart = data.indexOf("{");

				if (dataStart == 0 || typeof data === 'object') {
					jsonMorphoSourceResults = data;
				} else {
					jsonMorphoSourceResults = data.substr(dataStart);
				}

				jsonMorphoSourceResults = JSON.parse(jsonMorphoSourceResults);

				console.log(jsonMorphoSourceResults);

				// $("#morphoSourceApiResults").html(JSON.stringify(jsonMorphoSourceResults, null, 2));

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

						// $("#morphoSourceApiResultsRows").append("<div class='row' id='morphosourceMediaRows_" + result['medium.media_id'] + "'></p>");

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


function activateCreatorLookup() {
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

		//		template: {
		//			type: "custom",
		//			method: function (value, item) {
		//
		//				var valArr = value.split("|");
		//				var html = "";
		//
		//				html +=
		//					"<span class='result-line'><em>" + valArr[1] + "</span>";
		//				html +=
		//					"<span class='result-line smaller'>" + valArr[0] + "</span>";
		//
		//				return html;
		//			}
		//		},

		theme: "bootstrap"
	};

	$("#uploadsInfoCommonCreator").easyAutocomplete(options);
}

function editCommonMetadata(key, value) {
	console.warn(key + " | " + value);
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
	//	tplEdit = tplEdit.replace("{{{startDate}}}", obj.date.start);
	//	tplEdit = tplEdit.replace("{{{endDate}}}", obj.date.end);
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

	//	printSearchResults(results, "#searchResultsEvent", "event");
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
