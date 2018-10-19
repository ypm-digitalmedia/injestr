<?php
// get CAS login from headers/cookie

include_once "get_cas_user.php";

session_start(); 
if(!isset($_SESSION['random'])){  
     $_SESSION['randomone'] = mt_rand(100000, 999999);  
     $_SESSION['randomtwo'] = mt_rand(100000, 999999);  
}  
$randomone = $_SESSION['randomone'];  
$randomtwo = $_SESSION['randomtwo'];  

?>

	<!DOCTYPE html>
	<html lang="en">

	<head>


		<script>
			var cookieCasUser = "<?php echo $cas_username;?>";
			var logoutUrl = "<?php echo $logoutUrl;?>";
			//alert("hello, " + cookieCasUser);

		</script>

		<meta charset="utf-8" />
		<meta http-equiv="x-ua-compatible" content="ie=edge, chrome=1" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Injestr | NetX-Preservica Asset Upload</title>
		<link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">

		<!--    <link href="css/bootstrap-4.1.3.min.css" rel="stylesheet" />-->
		<link href="css/jquery-ui.css" rel="stylesheet" />
		<link href="css/jquery-ui.structure.css" rel="stylesheet" />
		<link href="css/jquery-ui.theme.css" rel="stylesheet" />
		<link href="css/jquery.tagsinput.min.css" rel="stylesheet" />
		<link href="css/bootstrap-3.2.0.min.css" rel="stylesheet" />
		<link href="css/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="css/bootstrap-dialog.css" rel="stylesheet" />
		<link href="css/bootstrap-select.css" rel="stylesheet" />
		<link href="css/dropzone.css" rel="stylesheet" />
		<link href="css/fonts.css" rel="stylesheet" />
		<link href="fonts/FontAwesome-5.2.0/css/all.min.css" rel="stylesheet" />
		<link href="css/easy-autocomplete.css" rel="stylesheet" />
		<link href="css/easy-autocomplete.themes.css" rel="stylesheet" />

		<link href="css/jquery.tagsinput.min-custom.css" rel="stylesheet" />
		<link href="css/easy-autocomplete-custom.css" rel="stylesheet" />
		<!--		<link href="css/style.css?v=" rel="stylesheet" />-->
		<?php echo '<link rel="stylesheet" href="css/style.css?v=' . $randomone . '" />'; ?>
	</head>

	<body>
		<header>
			<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
				<div class="container">
					<div class="navbar-header">
						<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
						<a class="navbar-brand" href="http://peabody.yale.edu" target="_blank">
                    <img class="logo-single" src="img/ypm_wordmark_single_small_white.png" />
                    <img class="logo-double" src="img/ypm_wordmark_double_small_white.png" />
                </a>
					</div>
					<div id="navbar" class="navbar-collapse collapse">
						<div class="login pull-right">
							<i class="fas fa-user"></i>
							<strong class="login-link-item" id="userName" title=""></strong>
							<a href="<?php echo $logoutUrl;?>" title="Log out" class="login-link-item" id="logoutLink">Log out</a>
						</div>
					</div>
					<!--/.navbar-collapse -->
				</div>
			</nav>
		</header>
		<main>
			<form id="mainForm" action="submit.php" method="POST" data-toggle="validator" role="form" data-focus="false">
				<div class="container" class="toplogo">
					<a href="javascript:void(0)">
						<div class="logo pull-left">
							<img src="img/injestr_logo.png" />
						</div>
						<div class="title pull-left">
							<h1 class="main-title">Injestr</h1>
							<h3 class="main-subtitle">Peabody Asset Uploader</h3>
						</div>

					</a>
				</div>





				<div class="container">
					<div class="wrapper">
						<ul class="nav nav-tabs" role="tablist">
							<li class="active" id="tabcontrol1">
								<a href="#tab1" data-toggle="tab" role="tab"><strong>1. Set Destination</strong></a>
							</li>
							<li id="tabcontrol2">
								<a href="#tab2" data-toggle="tab" role="tab"><strong>2. Select/Upload</strong></a>
							</li>
							<li id="tabcontrol3">
								<a href="#tab3" data-toggle="tab" role="tab"><strong>3. Submit</strong></a>
							</li>
						</ul>
					</div>
					<div class="tab-content">
						<div class="tab-pane fade in active" id="tab1">



							<!--
							<div class="container-fluid search-pane" id="searchPaneSelector">
								<div class="row row-pad">
									<div class="col-xs-12">
										<span id="searchByLabel"><strong>Search by&nbsp;</strong><strong id="searchByLabelRecord">Record</strong><strong id="searchByLabelEvent">Event</strong></span>
										<input type="checkbox" id="lookupToggle" checked></input>
									</div>
								</div>
							</div>
-->
							<!-- SEARCH TYPE SELECTOR -->

							<div class="container-fluid">
								<div class="wrapper">
									<ul class="nav nav-pills" role="tablist">

										<li style="padding-right: 2em;">
											<h5>Select:</h5>
										</li>

										<li class="active" id="tabcontrol11">
											<a href="#searchPaneGraphics" data-toggle="tab" role="tab"><i class="fas fa-camera"></i>&nbsp;<strong>Graphics</strong></a>
										</li>
										<li id="tabcontrol12">
											<a href="#searchPaneEvent" data-toggle="tab" role="tab"><i class="fas fa-images"></i>&nbsp;<strong>NetX</strong></a>
										</li>
										<li id="tabcontrol13">
											<a href="#searchPaneRecord" data-toggle="tab" role="tab"><i class="fas fa-cloud-upload-alt"></i>&nbsp;<strong>Wasabi</strong></a>
										</li>
									</ul>
								</div>

								<!-- Tab panes -->

								<div class="tab-content">
									<!-- SEND TO SALLY -->

									<div class="tab-pane fade in active" id="searchPaneGraphics">
										<div class="container-fluid">
											<div class="row row-pad">
												<div class="form-group col-xs-12">
													<input type="text" class="form-control" id="labelForSally" placeholder="Briefly, what is the purpose/project for this upload?" data-error="Please fill out this field." />
													<div class="help-block with-errors"></div>
												</div>
											</div>
											<div class="row row-pad">
												<div class="col-xs-12">
													<div id="searchResultsGraphics" class="search-results-container"></div>
												</div>
											</div>

											<div class="row row-pad">
												<div class="col-xs-12 align-center">
													<p align="center" class="align-center">
														<button class="btn btn-lg btn-primary" style="clear: both; margin-bottom: 15px;" type="button" id="graphicsStepOneNextButton">Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>
													</p>
												</div>
											</div>
										</div>
									</div>

									<!-- END -->

									<!-- SEARCH BY EVENT -->

									<div class="search-pane tab-pane fade" id="searchPaneEvent">
										<div class="container-fluid">
											<div class="row row-pad">
												<div class="form-group col-xs-12">
													<input type="text" class="form-control" id="searchEventAll" placeholder="Enter description, year, department, IRN, EMu number, or type" />
													<div class="help-block with-errors"></div>
												</div>
											</div>
											<div class="row row-pad">
												<div class="col-xs-12">
													<div id="searchResultsEvent" class="search-results-container"></div>
												</div>
											</div>

											<div class="row row-pad">
												<div class="col-xs-12 align-center">
													<p align="center" class="align-center">
														<button class="btn btn-lg btn-disabled" disabled="disabled" style="clear: both; margin-bottom: 15px;" type="button" id="eventStepOneNextButton">Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>
													</p>
												</div>
											</div>
										</div>
									</div>

									<!-- END -->


									<!-- SEARCH BY RECORD -->

									<div class="search-pane tab-pane fade" id="searchPaneRecord">
										<div class="container-fluid">
											<div class="row row-pad">
												<div class="col-sm-4 col-xs-8">
													<span>MorphoSource Record? </span>
												</div>
												<div class="col-sm-2 col-xs-4">
													<input type="checkbox" id="searchByRecordMorphoSource" checked value="true" />
												</div>
												<div class="col-sm-4 col-xs-8">
													<span>Private/Embargoed Data? </span>
												</div>
												<div class="col-sm-2 col-xs-4">
													<input type="checkbox" id="searchByRecordEmbargoed" value="false" />
												</div>
											</div>
											<div class="row row-pad">
												<div class="form-group col-xs-12">
													<input type="text" class="form-control" id="searchRecordAll" placeholder="Enter EMu catalog number" />
													<div class="help-block with-errors"></div>
												</div>
											</div>
											<div class="row row-pad">
												<div class="col-xs-12">
													<div id="searchResultsRecord" class="search-results-container"></div>
												</div>
											</div>

											<div class="row row-pad">
												<div class="col-xs-12 align-center">
													<p align="center" class="align-center">
														<button class="btn btn-lg btn-disabled" disabled="disabled" style="clear: both; margin-bottom: 15px;" type="button" id="recordStepOneNextButton">Select Media&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>
													</p>
												</div>
											</div>

										</div>


									</div>


									<!-- END -->

								</div>




							</div>



						</div>
						<div class="tab-pane fade" id="tab2">
							<div class="container-fluid" id="uploadsArea">
								<div class="row row-pad">
									<div class="col-xs-12">
										<div id="confirmedResultStepTwo" class="search-results-container">
											<p align="center" style="text-align: center">Please <a href="javascript:void(0)" class="edit-search-link">select a target</a> first.</p>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-xs-12">
										<h3 id="dropzoneHeading">Assets</h3>
										<h3 id="morphoSourceHeading">MorphoSource Media Records <span id="morphoSourceHeadingNum"></span></h3>
									</div>
								</div>
								<div class="row">
									<div class="col-xs-12">
										<div class="mimic-form-control dropzone" id="dropzoneArea"></div>
										<div class="mimic-form-control search-results-container" id="morphoSourceApiResults"></div>
									</div>
								</div>

								<div class="row row-pad-top" id="enterMetadataMessageContainer">
									<div class="col-xs-12 align-center">
										<p align="center" class="align-center" id="enterMetadataMessage">
											Done uploading files?
										</p>
										<p align="center" class="align-center" id="enterMetadataMessageMs">
											Done selecting media?
										</p>
										<p align="center" class="align-center">
											<button class="btn btn-lg btn-disabled" disabled="disabled" style="clear: both; margin-bottom: 15px;" type="button" id="metadataStartButton">Enter Metadata&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>
										</p>
									</div>
								</div>
								<div class="row row-pad-top" id="goToSubmitButtonContainer">
									<div class="col-xs-12 align-center">
										<p align="center" class="align-center">
											<button class="btn btn-lg btn-primary" style="clear: both; margin: 20px 0;" type="button" id="goToSubmitButton"><h2 style="margin: 0;"><i class="fas fa-clipboard-check"></i>&nbsp;Done</h2></button>
										</p>
										<!--                                    <p align="center">Click to submit</p>-->
									</div>
								</div>
							</div>
							<div class="container-fluid search-pane" id="uploadsInfoCommon">
								<div class="row row-pad-top">
									<div class="col-sm-6">
										<h3>Metadata: <span id="metadataNumber"></span></h3>
										<b><em id="currentMetadataItem"></em></b>
									</div>
									<div class="col-sm-6">
										<p align="right" style="margin-top: 20px">
											<button type="submit" class="btn btn-lg btn-success metadataButtonNext">Apply&nbsp;<i class="fas fa-check"></i></button>
										</p>
									</div>

								</div>



								<div class="row row-pad-top">
									<div class="form-group col-sm-4">
										<label for="uploadsInfoCommonCreator" class="control-label ms-irrelevant">Creator Name</label>
										<input type="text" class="form-control enter-metadata ms-irrelevant" id="uploadsInfoCommonCreator" placeholder="Creator name" required data-error="Creator name required.">
										<div class="help-block with-errors ms-irrelevant"></div>
									</div>
									<div class="form-group col-sm-4">
										<label for="uploadsInfoCommonTitle" class="control-label ms-irrelevant">Brief Descriptive Title</label>
										<input type="text" class="form-control enter-metadata ms-irrelevant" id="uploadsInfoCommonTitle" placeholder="Enter title" required data-error="Title required." onchange="editCommonMetadata('title',this.value)">
										<div class="help-block with-errors ms-irrelevant"></div>
									</div>
									<div class="form-group col-sm-4">
										<label for="uploadsInfoCommonDate" class="control-label ms-irrelevant">Date</label>
										<input type="text" class="form-control enter-metadata ms-irrelevant" id="uploadsInfoCommonDate" placeholder="Click to enter date" required data-error="Date required.">
										<div class="help-block with-errors ms-irrelevant" onchange="#"></div>
									</div>
								</div>

								<div class="row">
									<div class="form-group col-xs-12">
										<label id="metadataLabelKeywords" for="uploadsInfoCommonKeywords" class="control-label">Notes/Keywords</label>
										<input type="text" class="form-control enter-metadata" required id="uploadsInfoCommonKeywords" placeholder="Type something here..." data-error="Note/Keywords required."><span class="smaller"><em>separate tags with a semicolon (;)</em></span>
										<div class="help-block with-errors"></div>
									</div>
								</div>
								<div class="row">
									<div class="form-group col-sm-6">
										<label for="uploadsInfoCommonSpecialCreditLine" class="control-label ms-irrelevant">Special Credit Line</label>
										<input type="text" class="form-control enter-metadata ms-irrelevant" id="uploadsInfoCommonSpecialCreditLine" placeholder="Enter special credit line" onchange="editCommonMetadata('credit',this.value)"><span class="smaller ms-irrelevant"><em>(If applicable)</em></span>
									</div>
									<div class="form-group col-sm-6">
										<label for="uploadsInfoCommonSpecialUsage" class="control-label ms-irrelevant">Special Usage Permissions</label>
										<input type="text" class="form-control enter-metadata ms-irrelevant" id="uploadsInfoCommonSpecialUsage" placeholder="Enter special usage permissions" onchange="editCommonMetadata('usage',this.value)"><span class="smaller ms-irrelevant"><em>(If applicable)</em></span>
									</div>
								</div>

								<div class="row row-pad">
									<div class="col-xs-6">
										<p align="left">
											<button onclick="document.location.reload()" class="btn btn-danger start-over" style="margin-bottom: 15px;" type="button"><i class="fas fa-sync-alt"></i>&nbsp;Start over</button>
										</p>
									</div>
									<div class="col-xs-6">
										<p align="right">
											<button type="submit" class="btn btn-lg btn-success metadataButtonNext">Apply&nbsp;<i class="fas fa-check"></i></button>
										</p>
									</div>
								</div>

							</div>
						</div>
						<div class="tab-pane fade" id="tab3">




							<div class="container-fluid" id="editArea">
								<div class="row row-pad">
									<div class="col-xs-12">
										<div id="confirmedResultStepThree" class="search-results-container">
											<p align="center" style="text-align: center">Please <a href="javascript:void(0)" class="edit-event-search-link">select a target</a> first.</p>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="col-xs-12">
										<h3 id="finalNumSubmitted"></h3>
									</div>
								</div>

								<div class="row">
									<div class="col-xs-12">

									</div>

								</div>

								<div class="row row-pad-top" id="finalSummaryContainer">
									<div class="col-xs-12">
										<table class="table table-striped" id="finalSummary">
											<tr class='header'>

											</tr>
										</table>
									</div>
								</div>


								<div class="row row-pad-top" id="finalSubmitButtonContainer">
									<div class="col-xs-6">
										<p align="left">
											<button onclick="document.location.reload()" class="btn btn-danger start-over" style="margin-bottom: 15px;" type="button"><i class="fas fa-sync-alt"></i>&nbsp;Start over</button>
										</p>
									</div>
									<div class="col-xs-6">
										<p align="right">
											<button class="btn btn-lg btn-success" style="clear: both; margin:0;" type="button" id="finalSubmitButton"><h2 style="margin: 0;">Submit&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></h2></button>
											<!--
										<p align="center" class="align-center">
											<button onclick="confirm('ready to go?')" class="btn btn-danger start-over" style="margin-bottom: 15px;" type="button"><i class="fas fa-sync-alt"></i>&nbsp;Start over</button>
										</p>
-->
											<!--                                    <p align="center">Click to submit</p>-->
									</div>
								</div>

							</div>





						</div>
					</div>
				</div>








				<div class="container">
					<div class="row row-pad">
						<div class="col-xs-12 align-center">
							<p align="center">
								<button title="Show/hide output console" class="btn btn-default" id="outputToggle"><i class="fas fa-caret-up"></i></button>
							</p>
							<pre id="output"></pre>
						</div>
					</div>
				</div>






			</form>

		</main>




		<footer>
			<hr />
			<p align="center"><a href="javascript:feedbackEmail('0.2.14')">Report an Issue</a> | <strong>v0.2.14</strong> | Oct 19 2018</p>
		</footer>

		<!-- TEMPLATES START ----------------------------------------------------------------------------->









		<!-- DROPZONE THUMB -->

		<div id="tpl2">
			<div class="dz-preview dz-file-preview dz-image-preview">
				<div class="dz-image">
					<img data-dz-thumbnail="" src="">
				</div>
				<div class="dz-details no-clicky">
					<div class="dz-size"><span data-dz-size=""></span></div>
					<div class="dz-filename"><span data-dz-name=""></span></div>
				</div>
				<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress=""><span class="progress-text"></span></span>
				</div>
				<div class="dz-error-message"><span data-dz-errormessage=""></span></div>
				<div class="dz-success-mark">
					<svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
						<title>Check</title>      
						<defs></defs>
						<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">        <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup">
						</path>
						</g>
					</svg>
				</div>

				<div class="dz-error-mark">
					<svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">     <title>Error</title>      
			<defs></defs>      
			<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
				<g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">          <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>        </g>      </g>    
			</svg>
				</div>
				<a class="dz-remove" href="javascript:void(0)" data-dz-remove=""><i class="fas fa-trash-alt"></i> <b class="smaller">DELETE</b></a>
			</div>
		</div>


		<!-- SEARCH RESULTS - EVENT -->

		<div id="tplEvent">
			<div class="alert alert-success">
				<div class="row">
					<div class="col col-xs-12 col-sm-8">
						<span class="result-line"><i class="fas fa-check-circle"></i>&nbsp;<strong>SELECTED</strong></span>
						<span class="result-line"><em>{{{description}}}</em></span>
						<span class="result-line smaller space-top">{{{type}}}&nbsp;&bull;&nbsp;{{{startDate}}}&nbsp;&ndash;&nbsp;{{{endDate}}}</span>
						<span class="result-line smaller">{{{department}}}</span>
						<span class="result-line smaller">IRN&nbsp;{{{irn}}}&nbsp;&bull;&nbsp;{{{number}}}</span>
					</div>
					<div class="col col-xs-12 col-sm-4">
						<!--					<button class="btn btn-primary pull-right" style="clear: both; margin-bottom: 15px;" type="button" id="eventStepOneNextButton">Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>-->
						<button class="btn btn-default pull-right edit-event-search-link" style="clear: both" type="button" id="eventEditSearchLink"><i class="fas fa-pencil-alt"></i>&nbsp;Edit Search</button>
					</div>
				</div>
			</div>

		</div>

		<!-- SEARCH RESULTS - RECORD -->

		<div id="tplRecord">
			<div class="alert alert-success">
				<div class="row">
					<div class="col col-xs-12 col-sm-8">
						<span class="result-line"><i class="fas fa-check-circle"></i>&nbsp;<strong>SELECTED</strong></span>
						<span class="result-line"><em>{{{number}}}</em></span>
						<span class="result-line"><em>{{{name}}}</em></span>
						<span class="result-line smaller space-top">{{{collector}}}&nbsp;&bull;&nbsp;{{{date}}}</span>
						<span class="result-line smaller">{{{geography}}}</span>
						<span class="result-line smaller">IRN&nbsp;{{{irn}}}</span>
					</div>
					<div class="col col-xs-12 col-sm-4">
						<!--					<button class="btn btn-primary pull-right" style="clear: both; margin-bottom: 15px;" type="button" id="eventStepOneNextButton">Upload Assets&nbsp;<i class="fas fa-arrow-alt-circle-right"></i></button>-->
						<button class="btn btn-default pull-right edit-record-search-link" style="clear: both" type="button" id="recordEditSearchLink"><i class="fas fa-pencil-alt"></i>&nbsp;Edit Search</button>
					</div>
				</div>
			</div>

		</div>

		<!-- TEMPLATES START ----------------------------------------------------------------------------->

		<script src="js/jquery.min.js"></script>
		<!--		<script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>-->
		<script src="js/jquery.ajax-cross-origin.min.js"></script>
		<script src="js/jquery-ui.min.js"></script>
		<script src="js/jquery.easy-autocomplete.min.js"></script>
		<script src="js/jquery.tagsinput.min.js"></script>
		<!--	<script src="js/require.min.js"></script>-->
		<!--	<script src="js/tether.min.js"></script>-->
		<script src="js/moment.min.js"></script>
		<script src="fonts/FontAwesome-5.2.0/js/all.min.js"></script>
		<!--    <script src="js/bootstrap-4.1.3.min.js"></script> -->
		<script src="js/bootstrap-3.2.0.min.js"></script>
		<script src="js/validator.min.js"></script>
		<script src="js/bootstrap-toggle.min.js"></script>
		<script src="js/bootstrap-select.min.js"></script>
		<script src="js/bootstrap-dialog.min.js"></script>
		<script src="js/lodash.min.js"></script>
		<script src="js/dropzone.js"></script>
		<script src="js/tiff.min.js"></script>

		<!--		<script src="js/main.js"></script>-->
		<?php echo '<script src="js/main.js?v=' . $randomtwo . '"></script>'; ?>
	</body>

	</html>
