var myDropzone;

var theToggler;

var formData = {
	success: [],
	error: []
};

var searchTextEvent = "";
var searchTextRecord = "";

var selectedEvent = null;
var selectedRecord = null;

var hidWidth;
var scrollBarWidths = 40;

var jsonDataUsers = {};
var jsonDataEvents = {};
var jsonDataRecords = {};

var CASuser = {
	name: "",
	type: ""
};

var optsEventsBase;
var optsRecordsBase;

Dropzone.autoDiscover = false;
$(document).ready(function () {
	jsonDataUsers = loadJsonAsVar('data/users.json');
	jsonDataEvents = loadJsonAsVar('data/netx-events.json');
	detectUser();
	getPageWidth();
	resetSelects();


	$(window).resize(function () {
		getPageWidth();
	});


	myDropzone = new Dropzone("div#dropzoneArea", {
		url: "/file/post",
		paramName: "file", // The name that will be used to transfer the file
		maxFilesize: 2, // MB
		method: "post",
		withCredentials: false,
		timeout: 30000, //ms
		parallelUploads: 2,
		uploadMultiple: false,
		chunking: false,
		forceChunking: false,
		chunkSize: 2000000, //bytes
		parallelChunkUploads: false,
		retryChunks: false,
		retryChunksLimit: 3,
		maxFileSize: 256, //number of files to handle
		createImageTHumbnails: true,
		maxThumbnailFilesize: 10, //mb
		thumbnailWidth: 120, //px
		thumbnailHeight: 120, //px
		thumbnailMethod: "crop", //crop|contain
		resizeWidth: null, //images will be resized to these dimensions before being uploaded
		resizeHeight: null, //images will be resized to these dimensions before being uploaded
		resizeMimeType: null, //mime type of the resized image
		resizeQuality: 0.8,
		resizeMethod: "contain", //crop|contain
		filesizeBase: 1000, //1000|1024
		maxFiles: null, //limit the maximum number of files that will be handled by this Dropzone
		headers: null, //json object to send to server
		clickable: true,
		ignoreHiddenFiles: true,
		acceptedFiles: null, //ex: image/*,application/pdf,.psd
		acceptedMimeTypes: null, //DEPRECATED
		autoProcessQueue: true, //if false, files will be added to the queue but the queue will not be processed automatically.
		autoQueue: true, //if false, files added to the dropzone will not be queued by default. 
		addRemoveLinks: false, //add a link to every file preview to remove or cancel
		previewsContainer: null, //null=dropzone container|$("#element).dropzone-previews
		hiddenInputContainer: "body",
		capture: null, //null|camera|microphone|camcorder.  multiple=false for apple devices
		renameFilename: null, //DEPRECATED
		renameFile: null, //function that is invoked before the file is uploaded to the server and renames the file
		forceFallback: false,
		dictDefaultMessage: "<h1 class='pulsate align-center'>DROP FILES HERE<br /><i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i> <i class='fas fa-arrow-down'></i></h1>",
		dictFallbackMessage: "",
		dictFallbackText: "",
		dictFileTooBig: "",
		dictInvalidFileType: "",
		dictCancelUpload: "",
		dictUploadCanceled: "",
		dictCancelUploadConfirmation: "",
		dictRemoveFile: "",
		dictRemoveFileConfirmation: "",
		dictMaxFilesExceeded: "",
		dictFileSizeUnits: "",



		accept: function (file, done) {
			if (file.name == "justinbieber.jpg") {
				done("Naha, you don't.");
			} else {
				done();
			}
		},

		//        params: function() {},

		//        chunksUploaded: function () {},
		//        fallback: function () {},
		//        resize: function () {},
		//        transformFile: function (file, done) {},
		//        previewTemplate: document.querySelector('#tpl').innerHTML
	});


	myDropzone.on("addedfile", function (file) {
		console.log(file.upload.filename + " (" + formatBytes(file.size) + ") added to queue.");
	});

	//    myDropzone.on("success", function (file) {
	//        console.log(file.upload.filename + " (" + formatBytes(file.size) + ") uploaded successfully.");
	//    });
	//
	//    myDropzone.on("error", function (file) {
	//        console.warn(file.upload.filename + " (" + formatBytes(file.size) + ") upload failed.");
	//    });

	myDropzone.on("complete", function (file) {
		console.log(file.upload.filename + " (" + formatBytes(file.size) + ") processed.");
		makeData(file);
	});


	myDropzone.on("queuecomplete", function () {
		console.log("QUEUE COMPLETE");
	});





	//formData.push(file);






	$(".nav-tabs").on("click", "a", function (e) {
			e.preventDefault();
			if (!$(this).hasClass('add-contact')) {
				$(this).tab('show');
			}
		})
		.on("click", "span", function () {
			var anchor = $(this).siblings('a');
			$(anchor.attr('href')).remove();
			$(this).parent().remove();
			$(".nav-tabs li").children('a').first().click();
		});

	$('.add-tab').click(function (e, data) {
		e.preventDefault();
		var idPrefix = "img";
		var titlePrefix = "Image"
		var id = $(".nav-tabs").children().length;
		var tabId = idPrefix + '_' + id;
		$(this).closest('li').before('<li><a href="#' + idPrefix + '_' + id + '">' + titlePrefix + ' ' + id + '</a> <span> <i class="fas fa-times"></i> </span></li>');
		$('.tab-content').append('<div class="tab-pane" id="' + tabId + '">TAB CONTENT ' + id + '</div>');
		$('.nav-tabs li:nth-child(' + id + ') a').click();
		reAdjust();
	});



	var makeData = function (file) {
		//        console.log(file)
		var guid = createHexId(32);
		var filename = file.upload.filename;
		var extension = filename.substr(file.upload.filename.lastIndexOf(".") + 1);
		var truncateLength = 8;
		var filesize = formatBytes(file.size);
		var sports = dallas();

		var shortFilename = "";
		if (filename.length <= truncateLength + extension.length) {
			shortFilename = filename;
		} else {
			shortFilename = filename.substring(0, truncateLength) + "~." + extension;
		}

		var entry = {
			data: file,
			guid: guid,
			filename: filename,
			shortFilename: shortFilename,
			filesize: filesize,
			dallas: sports
		};
		formData.success.push(entry);
		//		makeTab(entry);
	};



	$("#logoutLink").click(function () {
		var newUrl = stripQs('cas');
		window.location.href = newUrl;
	});




	$('#searchEventAll').on('keyup keypress click', function (e) {
		searchTextEvent = $(this).val();
		//		console.log(searchTextEvent);
	})




	function makeUserLink(user) {
		console.log(user)
		$("#userName").text(user.name);
		$("#userName").attr("title", user.type);
		$('.login').fadeIn();
	}

	function detectUser() {

		CASuser.name = getQs('cas');

		var userName = "";

		var recordBasedUsers = jsonDataUsers.scope.records;
		var eventBasedUsers = jsonDataUsers.scope.events;
		var bothBasedUsers = jsonDataUsers.scope.both;
		console.log("record-based users: ", recordBasedUsers);
		console.log("event-based users: ", eventBasedUsers);
		console.log("both event- and record-based users: ", bothBasedUsers);

		if (!CASuser.name || CASuser.name == "") {
			// no user name passed in via query string
			var noUser = prompt("Enter your CAS username:");
			CASuser.name = noUser;

			if (_.includes(recordBasedUsers, noUser)) {
				//check for record-based
				console.warn("logged in as record-based user " + noUser);
				CASuser.type = "record";
				CASuser.type = "record";
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, noUser)) {
					console.warn("logged in as event-based user " + noUser);
					CASuser.type = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, noUser)) {
						console.warn("logged in as both event- and record-based user " + noUser);
						CASuser.type = "both";
					} else {
						//default
						console.warn("logged in as event-based user " + noUser);
						CASuser.type = "event";
					}
				}
			}


			userName = noUser;
			if (userName && userName != 'null') {
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
			} else {
				//check for event-based
				if (_.includes(eventBasedUsers, CASuser.name)) {
					console.warn("logged in as event-based user " + CASuser.name);
					CASuser.type = "event";
				} else {
					//check for both-based
					if (_.includes(bothBasedUsers, CASuser.name)) {
						console.warn("logged in as both event- and record-based user " + CASuser.name);
						CASuser.type = "both";
					} else {
						//default
						console.warn("logged in as event-based user " + CASuser.name);
						CASuser.type = "event";
					}
				}
			}
			userName = CASuser.name;
		}

		if (!userName || userName == 'null') {
			alert("not logged in!");
			stripQs('cas');
			location.reload();
		} else {
			//all good, let's go

			makeUserLink(CASuser);
			makeLookupSwitcher();
		}

	}

	$('#lookupToggle').change(function () {
		var status = $(this).prop('checked');
		var statusText = "";
		if (status === true) {
			statusText = "event";
			$("#searchPaneRecord").hide();
			$("#searchPaneEvent").fadeIn();
		} else {
			statusText = "record";
			$("#searchPaneEvent").hide();
			$("#searchPaneRecord").fadeIn();
		}

		console.log('Toggle: ' + status + " | " + statusText);

	})

	function makeLookupSwitcher() {

		if (CASuser.type == "event" || CASuser.type == "both") {
			$('#lookupToggle').prop("checked", true);
		} else {
			$('#lookupToggle').prop("checked", false);
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
			$('#lookupToggle').bootstrapToggle({
				on: 'Event',
				off: 'Record',
				onstyle: 'default',
				offstyle: 'default'
			});
		}

		// ===============================================================================
		// ======================== LOOKUP - EVENTS ======================================
		// ===============================================================================


		var optsEvents = {
			url: "data/ingester-metadata-netx.json",

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

					printSearchResults(obj, "event");

				}
			},
			template: {
				type: "custom",
				method: function (value, item) {
					//					return value + "<br /><span class='smaller'>IRN " + item.irn + " &bull; " + item.number + "</span>";

					var valArr = value.split("|");
					var html = "";

					html += "<span class='result-line'><em>" + valArr[5] + "</em></span>";
					html += "<span class='result-line smaller space-top'>" + valArr[6] + "&nbsp;&bull;&nbsp;" + valArr[2] + "&mdash;" + valArr[3] + "</span>";
					html += "<span class='result-line smaller'>" + valArr[4] + "</span>";
					html += "<span class='result-line smaller'>IRN&nbsp;" + valArr[0] + "&nbsp;&bull;&nbsp;" + valArr[1] + "</span>";

					return html;

				}
			},
			//			theme: "blue-light"
			theme: "bootstrap"
		};

		$("#searchEventAll").easyAutocomplete(optsEvents);


	}



	$("#eventStepOneNextButton").click(function () {

		alert("next!")
	})


	// dynamic DOM elements workaround
	$("body").click(function (event) {
		if ($(event.target).is("#eventEditSearchLink")) {
			$("#searchEventAll").focus();
		}
	})





	function loadJsonAsVar(url) {
		var obj;
		$.ajax({
			url: url,
			dataType: 'json',
			async: false,
			//			data: myData,
			success: function (data) {
				obj = data;
			}
		});
		return obj;
	}






});


function printSearchResults(obj, type) {
	clearSearchResults(type);
	if (type == "event") {
		var tpl = document.querySelector("#tplEvent").innerHTML;
		var dest = $("#searchResultsEvent");
		var destH = $("#searchResultsEventHeader");
		var destF = $("#searchResultsEventFooter");
	} else if (type == "record") {
		var tpl = document.querySelector("#tplRecord").innerHTML;
		var destH = $("#searchResultsRecordHeader");
		var destH = $("#searchResultsRecordFooter");
		var dest = $("#searchResultsRecord");
	}

	var tplEdit = tpl.replace("{{{description}}}", obj.description);
	tplEdit = tplEdit.replace("{{{type}}}", obj.type);
	tplEdit = tplEdit.replace("{{{startDate}}}", obj.date.start);
	tplEdit = tplEdit.replace("{{{endDate}}}", obj.date.end);
	tplEdit = tplEdit.replace("{{{department}}}", obj.department);
	tplEdit = tplEdit.replace("{{{irn}}}", obj.irn);
	tplEdit = tplEdit.replace("{{{number}}}", obj.number);

	$(dest).append(tplEdit);

}

function clearSearchResults(type) {
	if (type == "event") {
		var dest = $("#searchResultsEvent");
		var destH = $("#searchResultsEventHeader");
		var destF = $("#searchResultsEventFooter");
	} else if (type == "record") {
		var dest = $("#searchResultsRecord");
		var destH = $("#searchResultsRecordHeader");
		var destF = $("#searchResultsRecordFooter");
	}

	$(dest).empty();
	$(destH).empty();
	$(destF).empty();
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
	return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
}

function createHexId(length) {
	var choices = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	var hexString = "";
	for (var i = 0; i < length; i++) {
		hexString += _.sample(choices);
	}

	return hexString;
}

function syntaxHighlight(json) {
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				cls = 'key';
			} else {
				cls = 'string';
			}
		} else if (/true|false/.test(match)) {
			cls = 'boolean';
		} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

function dallas() {
	var choices = ['cowboys', 'stars', 'mavericks', 'fuel', 'rattlers', 'rayados', 'roughnecks', 'marshals', 'mustangs', 'desperados', 'black hawks', 'vigilantes', 'texans'];
	var str = _.sample(choices);
	return str;
}

function getQs(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function setQs(param, value) {
	var url = window.location.href;
	var new_url = url + '?' + param + '=' + value;
	history.pushState(null, null, new_url);
}

function stripQs(parameter, url) {
	if (!url) url = window.location.href;
	//prefer to use l.search if you have a location/link object
	var urlparts = url.split('?');
	if (urlparts.length >= 2) {

		var prefix = encodeURIComponent(parameter) + '=';
		var pars = urlparts[1].split(/[&;]/g);

		//reverse iteration as may be destructive
		for (var i = pars.length; i-- > 0;) {
			//idiom for string.startsWith
			if (pars[i].lastIndexOf(prefix, 0) !== -1) {
				pars.splice(i, 1);
			}
		}

		url = urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
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
	})


	//	printSearchResults(results, "#searchResultsEvent", "event");
}


// ============================================================








function resetSelects() {


	// remove "selected" from any options that might already be selected
	$('select option[selected="selected"]').each(
		function () {
			$(this).removeAttr('selected');
		}
	);
	// mark the first option as selected
	$("select option:first").attr('selected', 'selected');


}
