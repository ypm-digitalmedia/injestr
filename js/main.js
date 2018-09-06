var myDropzone;

var formData = {
	targetType: null,
	target: null,
	dateStamp: null,
	guid: null,
	user: null,
	assets: []
};


var showMoreInfoPopup;

var activeAsset = -1;
var sessionGUID = null;

var searchTextEvent = "";
var searchTextRecord = "";

var selectedEvent = null;
var selectedRecord = null;
var selectedTarget = null;

var jsonDataUsers = {};
var jsonDataEvents = {};
var jsonDataRecords = {};

var initialSearchType = "";
var searchType = "";

var CASuser = {
	name: "",
	type: ""
};

Dropzone.autoDiscover = false;
$(document).ready(function () {
	jsonDataUsers = loadJsonAsVar("data/users.json");
	jsonDataEvents = loadJsonAsVar("data/netx-events.json");
	detectUser();
	getPageWidth();
	resetSelects();

	clearForm();

	$(window).resize(function () {
		getPageWidth();
	});

	myDropzone = new Dropzone("div#dropzoneArea", {
		//		acceptedFiles: 'image/*,application/pdf,.psd,text/*,.zip,.tar,.tar.gz,.7z,.tif,.tiff,application/msword,.html,.htm', //ex: image/*,application/pdf,.psd
		acceptedMimeTypes: null, //DEPRECATED
		autoProcessQueue: true, //if false, files will be added to the queue but the queue will not be processed automatically.
		//		addRemoveLinks: true, //add a link to every file preview to remove or cancel
		autoQueue: true, //if false, files added to the dropzone will not be queued by default.
		capture: null, //null|camera|microphone|camcorder.  multiple=false for apple devices
		chunking: false,
		chunkSize: 2000000, //bytes
		clickable: true,
		createImageTHumbnails: true,
		dictDefaultMessage: "<h2 class='pulsate align-center'>DROP FILES / CLICK HERE<br /><i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i></h2>",
		dictFileTooBig: "File ({{filesize}}) is too large.  Max: {{maxFilesize}}",
		//		dictRemoveFile: "",
		filesizeBase: 1024, //1000|1024
		forceChunking: false,
		forceFallback: false,
		headers: {
			"folderName": sessionGUID,
			"type": searchType
		}, //json object to send to server
		hiddenInputContainer: "body",
		ignoreHiddenFiles: false,
		maxFiles: 50, //limit the maximum number of files that will be handled by this Dropzone
		maxFilesize: 4000, // MB
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
		retryChunks: false,
		retryChunksLimit: 3,
		thumbnailWidth: 120, //px
		thumbnailHeight: 120, //px
		thumbnailMethod: "crop", //crop|contain
		timeout: 300000, //ms
		uploadMultiple: false,
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
		complete: function (file, xhr, formData) {
			//			console.log(file);
			console.log(file.xhr.responseText);
			if (file.previewElement) {
				var progressElement = file.previewElement.querySelector(
					".dz-progress"
				);
				$(progressElement).fadeOut();
			}

		},
		error: function (file, error, xhr) {
			console.log(file);
			console.log(error);
			console.log(xhr);
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
			id: file.upload.uuid
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
		makeFilesClickable();
		$("#uploadsInfoCommon").fadeIn();
		myDropzone.removeEventListeners();
		//		document.getElementById("dropzoneHeading").scrollIntoView();
	});

	$("#goToSubmitButton").click(function () {
		setFormData('dateStamp', moment().toISOString());

		makeFinalDataTable();

		showTabThree();
	});

	function makeFinalDataTable() {
		$("#finalSummary tr").not(".header").remove();
		$("#finalNumSubmitted").html("Ready to submit " + formData.assets.length + " assets");
		var displayData = [];


		_.forEach(formData.assets, function (asset, index) {

			var rowString = "<tr>";
			rowString += "<td>" + parseInt(index + 1) + "</td>";
			rowString += "<td>" + asset.filename + "</td>";
			rowString += "<td>" + formData.assets[index].title + "</td>";
			rowString += "<td>" + $("span[data-dz-size]").eq(index).html() + "</td>";
			rowString += "<td><button type='button' onclick='showMoreInfoPopup(" + index + ")' class='btn btn-sm btn-default' title='Details'><i class='fas fa-ellipsis-h'></i></button></td>";
			rowString += "</tr>";

			$("#finalSummary").append(rowString);
		});

	}




	showMoreInfoPopup = function (index) {
		var msgHTML = "";

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

		} else {

			var thumbHTML = '<div class="popup-thumbnail" id="assetThumb_' + formData.assets[index]._id + '" style="background-image: url(\'uploads/' + sessionGUID + '/' + formData.assets[index].filename + '\')"></div>';
		}

		var sizeStringSimple = $("span[data-dz-size]").eq(index).html().split("<strong>").join("").split("</strong>").join("");

		var tableHTML = '<table class="table table-striped">';
		tableHTML += '<tr><td><strong>File Name</td><td>' + formData.assets[index].filename + '</td></tr>';
		tableHTML += '<tr><td><strong>File Size</td><td>' + sizeStringSimple + '</td></tr>';
		tableHTML += '<tr><td><strong>Creator Name</strong></td><td>' + formData.assets[index].creatorName.last + ', ' + formData.assets[index].creatorName.first + ' ' + formData.assets[index].creatorName.middle + '</td></tr>';
		tableHTML += '<tr><td><strong>Title</strong></td><td>' + formData.assets[index].title + '</td></tr>';
		tableHTML += '<tr><td><strong>Date</strong></td><td>' + formData.assets[index].date + '</td></tr>';
		tableHTML += '<tr><td><strong>Keywords</strong></td><td>' + formData.assets[index].keywords + '</td></tr>';
		tableHTML += '<tr><td><strong>Special Credit Line</strong></td><td>' + formData.assets[index].credit + '</td></tr>';
		tableHTML += '<tr><td><strong>Special Usage Permissions</strong></td><td>' + formData.assets[index].usage + '</td></tr>';
		tableHTML += '</table>';

		msgHTML = thumbHTML + tableHTML;

		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_DEFAULT,
			title: '<h4>Details: Asset #' + parseInt(index + 1) + '</h4>',
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
		_.forEach(myDropzone.files, function (f) {
			f.previewElement.classList.remove("dz-success");
		});

		$("a.dz-remove").slideUp();
		$("#dropzoneArea").css("cursor", "auto");
		$("#enterMetadataMessageContainer").fadeOut();
		_.forEach(myDropzone.files, function (file) {
			$(file.previewElement)
				.children(".dz-image")
				.addClass("red-border");

			file.previewElement.addEventListener("click", function () {
				//				console.log(file);
				//				if ($(file.previewElement).children(".dz-image").hasClass("red-border")) {
				//					$(file.previewElement).children(".dz-image").removeClass("red-border").addClass("red-border-selected");
				//				} else {
				//					$(file.previewElement).children(".dz-image").removeClass("green-border").addClass("green-border-selected");
				//				}
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

	function activateMetadata(file) {
		var asset = _.find(formData.assets, function (a) {
			return a._id == file.upload.uuid;
		});
		var num = formData.assets.indexOf(asset);
		//		console.log(num);
		//		console.log(asset);

		//        if( activeAsset == -1 ) { activeAsset = 0; } else { 
		//            
		//        }

		var upload = myDropzone.files[num];
		var uploadElement = $(upload.previewElement).children(".dz-image");
		var uploadElementContainer = $(upload.previewElement).children(".dz-details");

		uploadElementContainer.removeClass("no-clicky").addClass("clicky");

		//		console.log(upload);
		//		console.log(uploadElement);

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

					$("#uploadsInfoCommonCreatorLast").val(asset.creatorName.last);
					$("#uploadsInfoCommonCreatorFirst").val(asset.creatorName.first);
					$("#uploadsInfoCommonCreatorMiddle").val(asset.creatorName.middle);
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

				var upload = myDropzone.files[activeAsset];
				var uploadElement = $(upload.previewElement).children(".dz-image");

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


		$.ajax({
			type: 'post',
			url: 'finalize.php',
			dataType: 'json',
			//			data: 'data=' + JSON.stringify(formData),
			data: 'data=' + JSON.stringify(formData) + '&folderName=' + sessionGUID + "&type=" + searchType,
			success: function (result) {
				// check result object for what you returned
				showFinalSuccessDialog(result);
			},
			error: function (error) {
				// check error object or return error
				//				showFinalErrorDialog(error);
				console.warn(error);
			}
		});

		showFinalSuccessDialog();
	})

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
			message: '<p>Your submission was successful. Please allow time for these assets to propagate throughout the NetX / Preservica system.</p>',
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
				initialSearchType = "record";
				searchType = "record";
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, noUser)) {
					console.warn("logged in as event-based user " + noUser);
					CASuser.type = "event";
					initialSearchType = "event";
					searchType = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, noUser)) {
						console.warn(
							"logged in as both event- and record-based user " +
							noUser
						);
						CASuser.type = "both";
						initialSearchType = "event";
						searchType = "event";
					} else {
						//default
						console.warn("logged in as event-based user " + noUser);
						CASuser.type = "event";
						initialSearchType = "event";
						searchType = "event";
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
				initialSearchType = "record";
				searchType = "record";
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, CASuser.name)) {
					console.warn(
						"logged in as event-based user " + CASuser.name
					);
					CASuser.type = "event";
					initialSearchType = "event";
					searchType = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, CASuser.name)) {
						console.warn(
							"logged in as both event- and record-based user " +
							CASuser.name
						);
						CASuser.type = "both";
						initialSearchType = "event";
						searchType = "event";
					} else {
						//default
						console.warn(
							"logged in as event-based user " + CASuser.name
						);
						CASuser.type = "event";
						initialSearchType = "event";
						searchType = "event";
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

		setFormData("targetType", searchType);
		setFormData("user", CASuser.name);

		sessionGUID = makeGUID();
		setFormData("guid", sessionGUID);


		//focus search pane initially
		if (searchType == "event") {
			$("#searchEventAll").focus();
		} else {
			$("#searchRecordAll").focus();
		}
	}

	$("#lookupToggle").change(function () {
		var status = $(this).prop("checked");
		var statusText = "";
		if (status === true) {
			statusText = "event";
			searchText = "event";
			setFormData("targetType", "event");
			$("#searchPaneRecord").hide();
			$("#searchPaneEvent").fadeIn();
		} else {
			statusText = "record";
			searchText = "record";
			setFormData("targetType", "record");
			$("#searchPaneEvent").hide();
			$("#searchPaneRecord").fadeIn();
		}

		console.log("Toggle: " + status + " | " + statusText);
	});

	function makeLookupSwitcher() {
		if (CASuser.type == "event" || CASuser.type == "both") {
			$("#lookupToggle").prop("checked", true);
		} else {
			$("#lookupToggle").prop("checked", false);
		}

		// make toggle switch
		if (CASuser.type == "event") {
			$("#searchByLabelEvent").show();
			$("#lookupToggle").hide();
		} else if (CASuser.type == "record") {
			$("#searchByLabelRecord").show();
			$("#searchPaneEvent").hide();
			$("#searchPaneRecord").show();
			$("#lookupToggle").hide();
		} else {
			$("#lookupToggle").bootstrapToggle({
				on: "Event",
				off: "Record",
				onstyle: "default",
				offstyle: "default"
			});
		}

		// ========================================================================
		// ===================== LOOKUP - EVENTS ==================================
		// ========================================================================

		var optsEvents = {
			//			url: "data/ingester-metadata-netx.json",
			url: "../data/ingester-metadata-netx.json",

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
					var obj = $("#searchEventAll").getSelectedItemData();

					$("#searchEventAll").val(searchTextEvent);

					if ($("#eventStepOneNextButton").hasClass("btn-disabled")) {
						$("#eventStepOneNextButton").prop("disabled", false);
						$("#eventStepOneNextButton")
							.removeClass("btn-disabled")
							.addClass("btn-primary");
						showTabTwo();

						$("#eventStepOneNextButton").click(function () {
							showTabTwo();
						});

						$("#dropzoneArea").show();
					}

					printSearchResults(obj, "event");
					setFormData("target", obj);
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
						valArr[6] +
						"&nbsp;&bull;&nbsp;" +
						valArr[2] +
						"&mdash;" +
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

		$("#searchEventAll").easyAutocomplete(optsEvents);
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
		asset.creatorName.last = $("#uploadsInfoCommonCreatorLast").val();
		asset.creatorName.first = $("#uploadsInfoCommonCreatorFirst").val();
		asset.creatorName.middle = $("#uploadsInfoCommonCreatorMiddle").val();
		asset.title = $("#uploadsInfoCommonTitle").val();
		asset.date = $("#uploadsInfoCommonDate").val();
		asset.keywords = $("#uploadsInfoCommonKeywords").val();
		asset.credit = $("#uploadsInfoCommonSpecialCreditLine").val();
		asset.usage = $("#uploadsInfoCommonSpecialUsage").val();

		myDropzone.files[target].previewElement.classList.add("dz-success");
		setTimeout(function () {
			myDropzone.files[target].previewElement.classList.remove("dz-success");
			//            console.log("css reset | " + target )
		}, 3000);

		printFormData();

		if (target != formData.assets.length - 1) {
			//advance
			activateMetadata(myDropzone.files[parseInt(target + 1)]);
		}


	}



	function setFormData(key, value) {
		//		console.log(key, value)
		if (!key && !value) {
			//generic form data set
			console.warn("bad function call");
		} else {
			if (!value) {
				value = "not set";
			}

			// set specific key/value

			if (key == "assets") {
				var obj = {
					valid: false,
					creatorName: {
						first: $("#uploadsInfoCommonCreatorFirst").val(),
						middle: $("#uploadsInfoCommonCreatorMiddle").val(),
						last: $("#uploadsInfoCommonCreatorLast").val()
					},
					title: $("#uploadsInfoCommonTitle").val(),
					date: $("#uploadsInfoCommonDate").val(),
					keywords: $("#uploadsInfoCommonKeywords").val(),
					credit: $("#uploadsInfoCommonSpecialCreditLine").val(),
					usage: $("#uploadsInfoCommonSpecialUsage").val(),
					filename: value.name,
					filesize: value.size,
					filetype: value.type,
					_id: value.id
				};

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
		}
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
	}

	var tplEdit = tpl.replace("{{{description}}}", obj.description);
	tplEdit = tplEdit.replace("{{{type}}}", obj.type);
	tplEdit = tplEdit.replace("{{{startDate}}}", obj.date.start);
	tplEdit = tplEdit.replace("{{{endDate}}}", obj.date.end);
	tplEdit = tplEdit.replace("{{{department}}}", obj.department);
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
