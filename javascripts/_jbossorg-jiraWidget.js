/*

Jira widget is a small display of several JIRA issues found by a given query
in a specified place on the website. Data is downloaded using AJAX from JIRA REST
services and cached in SessionStorage of the webrowser, so that it's not downloaded
on each refresh.

Widget code requires jQuery to be available.

An example of how to use the widget.

<!--
  You have to define somewhere on the page where you want the content to be rendered.
  It's important to define 'id' attribute becuase it's later used as an initialization
  parameter
-->
<div id="jiraDiv"> </div>

<!--
  It's also required to initialize the widget by executing following JavaScript function.
-->
<script type="text/javascript">
	$(document).ready(function () {
      processJiraWidget(  {
        jqlQuery : 'project = ORG AND (status = Open OR status = Reopened)',
        maxResults : 5,
        startAt : 0,
        divId : 'jiraDiv',
        title : 'Jira Issues'
      })
    });
</script>

*/

function renderJiraWidget(params) {
	$(document).ready( processJiraWidget( params ));
}

// Function checks sessionStorage if there is cached content, validates its age
// and optionally downloads a new from REST service and caches it.
function processJiraWidget(params) {

	// Renders content html into div with the given id
	function renderHtml(data) {

		// Searching for the div where content should be injected.
		var div = document.getElementById(params.divId);
		if (div == null) {
			console.log('Could not find div with '+params.divId+' id to render jira widget.');
			return;
		}

		var dataArray = data.issues;

		var rawTableBodyHtml = '';
		var rowType = 'oddRow';

		// Iteration through results displaying each issue found by the query.
		for (var i=0; i<dataArray.length ; i++) {

			var rowData = dataArray[i];

			rawTableBodyHtml += '<div class="issue '+rowType+'"><span class="jira-icon jira-issuetype-'+rowData.fields.issuetype.id+'">&nbsp;</span>';
			rawTableBodyHtml += '<a href="http://jira.jboss.org/browse/'+rowData.key+'">'+rowData.key+':</a>&nbsp;';
			rawTableBodyHtml += $('<div />').html(rowData.fields.summary).text();
			rawTableBodyHtml += '<ul>';

			rawTableBodyHtml += '<li id="status"><b>Status:</b>&nbsp;<span class="jira-icon jira-status-'+rowData.fields.status.id;
			rawTableBodyHtml += '">&nbsp;</span>'+rowData.fields.status.name+'</li>';

			rawTableBodyHtml += '<li id="reporter"><b>Reporter:</b>&nbsp;'+rowData.fields.reporter.displayName+'</li>';

			var assignee = rowData.fields.assignee==null ? 'Unassigned' : rowData.fields.assignee.displayName;
			rawTableBodyHtml += '<li id="assignee"><b>Assignee:</b>&nbsp;'+assignee+'</li>';

			var createDate = new Date(safarifyDateString(rowData.fields.created));
			var createDateStr = createDate.toLocaleDateString()+'&nbsp;'+createDate.toLocaleTimeString();
			rawTableBodyHtml += '<li id="created"><b>Created:</b>&nbsp;'+createDateStr+'</li>';

			var updateDate = new Date(safarifyDateString(rowData.fields.updated));
			var updateDateStr = updateDate.toLocaleDateString()+'&nbsp;'+updateDate.toLocaleTimeString();
			rawTableBodyHtml += '<li id="lastUpdated"><b>Last updated:</b>&nbsp;'+updateDateStr+'</li>';

			rawTableBodyHtml += '</ul></div>';

			// Switching style class selector for zebra table, if used.
			rowType = rowType=='oddRow' ? 'evenRow' : 'oddRow';

		}

		var rawTableHtml = '<div class="whitebox issue-mod" >';
		rawTableHtml += '<h3>'+params.title+'</h3>';
		rawTableHtml += '<div>';
		rawTableHtml += rawTableBodyHtml;
		rawTableHtml += '</div>';
		rawTableHtml += '</div>';

		div.innerHTML = rawTableHtml;
	}

	// Function modifies a bit string representation of a date so that it's consumable on Safari browser.
	function safarifyDateString(dateStr) {
		dateStr = dateStr.replace(/\.\d\d\d/, "");
		return dateStr.substring(0,dateStr.length-2)+':'+dateStr.substring(dateStr.length-2,dateStr.length);
	}

	// This function searches for the queried data in SessionStorage of the web browser.
	function getDataFromCache(settings) {

		var valueFromCache = null;

		// Checking whether the browser supports Local Storage and if there is cached item available.
		if (window.sessionStorage
				&& window.sessionStorage.getItem("jiraWidgetCache"+settings.divId)) {

			var temp = JSON.parse(window.sessionStorage
					.getItem("jiraWidgetCache"+settings.divId));

			// Checking if the item in cache is not older than 1 hour
			// and if the data inside was created with the same settings.
			if (new Date() - new Date(Date.parse(temp.cachedDate)) < (1000 * 60 * 60)
					&& JSON.stringify(temp.settings)==JSON.stringify(settings)) {
				valueFromCache = temp;
			}

		}

		return valueFromCache;
	}

	// Here starts main function body.

	var settings = {};

	// User needs to provide at least JQL query and div id parameters otherwise we cancel the rendering.
	if (params && params.jqlQuery && params.divId) {

		settings.startAt = params.startAt || 0;
		settings.maxResults = params.maxResults || 15;
		settings.jqlQuery = params.jqlQuery;
		settings.divId = params.divId;

	} else {

		console.log('JiraWidget requires providing at least jqlQuery and divId parameters.');
		return;

	}

	// Trying to get data from web browser's sessionStorage
	var fromCache = getDataFromCache(settings);

	if (fromCache) {

		renderHtml( fromCache );

	} else {

		// Trying to query the data.

		// Callback function definition for JSONP call.
		window['jiraJsonpResponseHandler'+settings.divId] = function(result) {

			if (window.sessionStorage) {
				result.cachedDate = new Date();
				result.settings = settings;
				window.sessionStorage.setItem("jiraWidgetCache"+settings.divId,JSON.stringify(result));
			}

			renderHtml( result );
		}

		// Since there was no data in cache we schedule an AJAX call to get the data.
		var query = {};
		query.jql = settings.jqlQuery;
		query.startAt = settings.startAt;
		query.maxResults = settings.maxResults;
		query['jsonp-callback'] = "jiraJsonpResponseHandler"+settings.divId;

		$.ajax({
		  type : "POST",
			url : "http://issues.jboss.org/rest/api/2/search",
			dataType : 'jsonp',
			data: query
		});

	}

}