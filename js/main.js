var myDropzone;

var theToggler;

var formData = {
	success: [],
	error: []
};

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

	//
	//	var makeTab = function (entry) {
	//		console.log(entry);
	//		var idPrefix = "img";
	//		var titlePrefix = "Image"
	//		var id = $(".nav-tabs").children().length;
	//		var tabId = idPrefix + '_' + id;
	//		var tabTarget = $(".add-tab");
	//
	//		tabTarget.closest('li').before('<li><a href="#' + idPrefix + '_' + id + '">' + titlePrefix + ' ' + id + '</a> <span> <i class="fas fa-times"></i> </span></li>');
	//		$('.tab-content').append('<div class="tab-pane" id="' + tabId + '"><h2>Image ' + id + '</h2><pre>' + syntaxHighlight(JSON.stringify(entry, undefined, 4)) + '</pre></div>');
	//		$('.nav-tabs li:nth-child(' + id + ') a').click();
	//
	//		reAdjust();
	//
	//
	//	};







	//
	//	var widthOfList = function () {
	//		var itemsWidth = 0;
	//		$('.list li').each(function () {
	//			var itemWidth = $(this).outerWidth();
	//			itemsWidth += itemWidth;
	//		});
	//		return itemsWidth;
	//	};
	//
	//	var widthOfHidden = function () {
	//		return (($('.wrapper').outerWidth()) - widthOfList() - getLeftPosi()) - scrollBarWidths;
	//	};
	//
	//	var getLeftPosi = function () {
	//		return $('.list').position().left;
	//	};
	//
	//	var reAdjust = function () {
	//		if (($('.wrapper').outerWidth()) < widthOfList()) {
	//			$('.scroller-right').show();
	//		} else {
	//			$('.scroller-right').hide();
	//		}
	//
	//		if (getLeftPosi() < 0) {
	//			$('.scroller-left').show();
	//		} else {
	//			$('.item').animate({
	//				left: "-=" + getLeftPosi() + "px"
	//			}, 'slow');
	//			$('.scroller-left').hide();
	//		}
	//	}
	//
	//	reAdjust();
	//
	//	$(window).on('resize', function (e) {
	//		reAdjust();
	//	});

	//	$('.scroller-right').click(function () {
	//
	//		$('.scroller-left').fadeIn('slow');
	//		$('.scroller-right').fadeOut('slow');
	//
	//		$('.list').animate({
	//			left: "+=" + widthOfHidden() + "px"
	//		}, 'slow', function () {
	//
	//		});
	//	});
	//
	//	$('.scroller-left').click(function () {
	//
	//		$('.scroller-right').fadeIn('slow');
	//		$('.scroller-left').fadeOut('slow');
	//
	//		$('.list').animate({
	//			left: "-=" + getLeftPosi() + "px"
	//		}, 'slow', function () {
	//
	//		});
	//	});

	$("#logoutLink").click(function () {
		var newUrl = stripQs('cas');
		window.location.href = newUrl;
	});



	$("form").submit(function (event) {
		//		console.log($(this).serializeArray());
		//		console.log($(this).serialize());
		//		event.preventDefault();
	});









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




		// make custom selectPickers
		$('.selectpicker').selectpicker({
			style: 'btn-info',
			size: 4
		});

		// initiate datepickers
		$("#searchEventStart").datepicker({
			dropupAuto: false,
			dateFormat: 'yy',
			onSelect: function (dateText, inst) {
				//				console.warn(inst)
				searchByEventDateStart(inst);
			}
		});

		$("#searchEventEnd").datepicker({
			dropupAuto: false,
			dateFormat: 'yy',
			onSelect: function (dateText, inst) {
				//				console.warn(inst)
				searchByEventDateEnd(inst);
			}
		});

		// initiate autocomplete

		// ===============================================================================
		// ======================== LOOKUP - EVENTS ======================================
		// ===============================================================================

		// ============ Description ======================================================

		var optsEventsDescription = {
			url: "data/netx-events.json",

			getValue: "description",
			listLocation: function (el) {
				return el;
			},
			template: {
				type: "custom",
				method: function (value, item) {
					return value + "<br /><span class='smaller'>IRN " + item.irn + " &bull; " + item.number + "</span>";
				}
			},
			list: {
				maxNumberOfElements: 10,
				match: {
					enabled: true
				},
				sort: {
					enabled: true
				},
				onChooseEvent: function () {
					var value = $("#searchEventDescription").getSelectedItemData();
				}
			},

			theme: "bootstrap"
		};

		$("#searchEventDescription").easyAutocomplete(optsEventsDescription);

		// ============ IRN ======================================================

		var optsEventsIrn = {
			url: "data/netx-events.json",

			getValue: "irn",
			listLocation: function (el) {
				return el;
			},
			template: {
				type: "custom",
				method: function (value, item) {
					return "<strong</strong>IRN " + value + " &bull; " + item.number + "<br /><span class='smaller'>" + item.description + "</span>";
				}
			},
			list: {
				maxNumberOfElements: 10,
				match: {
					enabled: true
				},
				sort: {
					enabled: true
				},
				onChooseEvent: function () {
					var value = $("#searchEventIrn").getSelectedItemData();
				}
			},

			theme: "bootstrap"
		};

		$("#searchEventIrn").easyAutocomplete(optsEventsIrn);

		// ============ Number ======================================================	

		var optsEventsNumber = {
			url: "data/netx-events.json",

			getValue: "number",
			listLocation: function (el) {
				return el;
			},
			template: {
				type: "custom",
				method: function (value, item) {
					return "IRN " + item.irn + " &bull; <strong>YPME.</strong>" + value.split(".")[1] + "<br /><span class='smaller'>" + item.description + "</span>";
				}
			},
			list: {
				maxNumberOfElements: 10,
				match: {
					enabled: true
				},
				sort: {
					enabled: true
				},
				onChooseEvent: function () {
					var value = $("#searchEventNumber").getSelectedItemData();
					$("#searchEventNumber").val(value.number.split(".")[1]);
				}
			},

			theme: "bootstrap"
		};

		$("#searchEventNumber").easyAutocomplete(optsEventsNumber);


	}





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


function printSearchResults(results, dest, type) {
	clearSearchResults(type);
	if (type == "event") {
		var tpl = document.querySelector("#tplEvent").innerHTML;
		var destH = $("#searchResultsEventHeader");
	} else if (type == "record") {
		var tpl = document.querySelector("#tplRecord").innerHTML;
		var destH = $("#searchResultsRecordHeader");
	}

	var pluralString = "s";
	if (results.length == 1) {
		pluralString = "";
	}
	$(destH).append("<h3>" + results.length + " result" + pluralString + "</h3>");

	if (results.length == 0) {
		$(destH).empty();
		$(dest).html('<p align="center"><em>No results.  Try simplifying your search.</em></p>');
	}


	_.forEach(results, function (r) {

		var tplEdit = tpl.replace("{{{description}}}", r.description);
		tplEdit = tplEdit.replace("{{{type}}}", r.type);
		tplEdit = tplEdit.replace("{{{startDate}}}", r.date.start);
		tplEdit = tplEdit.replace("{{{endDate}}}", r.date.end);
		tplEdit = tplEdit.replace("{{{department}}}", r.department);
		tplEdit = tplEdit.replace("{{{irn}}}", r.irn);
		tplEdit = tplEdit.replace("{{{number}}}", r.number);

		$(dest).append(tplEdit);
	});


}

function clearSearchResults(type) {
	if (type == "event") {
		var dest = $("#searchResultsEvent");
		var destH = $("#searchResultsEventHeader");
	} else if (type == "record") {
		var dest = $("#searchResultsRecord");
		var destH = $("#searchResultsRecordHeader");
	}

	$(dest).empty();
	$(destH).empty();
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


function searchByEventDateStart(date) {
	if (typeof (date) === 'object') {
		//valid datepicker object
		//parse year automatically with "dateformat: 'yy'" in options
		var date_parsed = date.selectedYear;
	} else {
		//convert text to moment, grab year if possible
		var date_obj = moment(new Date(date));
		if (date_obj._isValid) {
			var date_parsed = date_obj.clone().year() + 1;
			console.warn(date_parsed);
		} else {
			var date_parsed = "";
		}
	}
	//	$("#searchEventStart").val(date_parsed);
	console.log(date_parsed);
	searchByEvent();
}

function searchByEventDateEnd(date) {
	if (typeof (date) === 'object') {
		//valid datepicker object
		//parse year automatically with "dateformat: 'yy'" in options
		var date_parsed = date.selectedYear;
	} else {
		//convert text to moment, grab year if possible
		var date_obj = moment(new Date(date));
		if (date_obj._isValid) {
			var date_parsed = date_obj.clone().year() + 1;
			console.warn(date_parsed);
		} else {
			var date_parsed = "";
		}
	}
	//	$("#searchEventEnd").val(date_parsed);
	console.log(date_parsed);
	searchByEvent();
}

//function searchByEventDate(date) {
//
//	console.log(date);
//	searchByEvent();
//}

function searchByEventDepartment(dept) {

	console.log(dept);
	searchByEvent();
}

function searchByEventType(type) {

	console.log(type);
	searchByEvent();
}

function searchByEventIrn(irn) {

	console.log(irn);
	searchByEvent();
}

function searchByEventNumber(number) {
	if (number.toString().indexOf(".") == -1) {
		if (number.length == 0 || !number || number == "") {
			number_parsed = "";
		} else {
			var number_parsed = "YPME." + number;
		}
	} else {
		var number_parsed = number;
	}
	console.log(number_parsed);
	searchByEvent();
}

function searchByEventDescription(desc) {

	console.log(desc);
	searchByEvent();
}

// ============================================================

function searchByEvent() {
	$("#mainForm").validator('validate');
	var eIrn = $("#searchEventIrn").val();

	var eNumRaw = $("#searchEventNumber").val();
	if (eNumRaw.toString().indexOf(".") == -1) {
		if (eNumRaw.length == 0 || !eNumRaw || eNumRaw == "") {
			eNum = "";
		} else {
			//			var eNum = "YPME." + eNumRaw;
			var eNum = eNumRaw;
		}
	} else {
		var eNum = eNumRaw;
	}

	var eDateS = $("#searchEventStart").val();
	var eDateE = $("#searchEventEnd").val();

	var dateValS = parseInt(eDateS);
	var dateValE = parseInt(eDateE);

	if (isNaN(dateValS) || dateValS < 1000 || dateValS > 9999) {
		eDateS = "";
	}

	if (isNaN(dateValE) || dateValE < 1000 || dateValE > 9999) {
		eDateE = "";
	}

	var eDesc = $("#searchEventDescription").val();
	var eType = $("#searchEventType").val();
	var eDept = $("#searchEventDepartment").val();

	var filterEvalArr = [];

	//	var sseIrn = "";
	//	var sseNum = "";
	//	var sseDateS = "";
	//	var sseDateE = "";
	//	var sseDesc = "";
	//	var sseType = "";
	//	var sseDept = "";

	if (eIrn != "") {
		filterEvalArr.push('o.irn.indexOf("' + eIrn + '") > -1');
	}
	if (eNum != "") {
		filterEvalArr.push('o.number.indexOf("' + eNum + '") > -1');
	}
	if (eDateS != "") {
		filterEvalArr.push('parseInt( o.date.start ) >= parseInt(' + eDateS + ')');
	}
	if (eDateE != "") {
		filterEvalArr.push('parseInt( o.date.end ) <= parseInt(' + eDateE + ')');
	}
	if (eDesc != "") {
		filterEvalArr.push('o.description.indexOf("' + eDesc + '") > -1');
	}
	if (eType != "") {
		filterEvalArr.push('o.type.indexOf("' + eType + '") > -1');
	}
	if (eDept != "") {
		filterEvalArr.push('o.department.indexOf("' + eDept + '") > -1');
	}

	var filterEvalString = filterEvalArr.join(" && ");

	console.log(filterEvalString);

	console.log("\n\n\n\neIrn: " + eIrn + "\neNum: " + eNum + "\neDateS: " + eDateS + "\neDateE: " + eDateE + "\neDesc: " + eDesc + "\neType: " + eType + "\neDept: " + eDept + "\n\n\n\n")

	var results = _.filter(jsonDataEvents, function (o) {
		return eval(filterEvalString);
	})

	//print the JSON
	//	var pre = "<pre></pre>";
	//	var json = $(pre).text(JSON.stringify(results, null, 2));
	//	$("#searchResultsEvent").append(json);

	//or, send the JSON to a function
	printSearchResults(results, "#searchResultsEvent", "event");
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
