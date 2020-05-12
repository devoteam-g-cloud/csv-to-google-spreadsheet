/*
 * Enable Resources > Advanced Google Services > "BigQuery v2"
 */

var config = {
    "gcp": {
        "project": "GCP PROJECT BILLED FOR THE QUERY"
    },
    "bigquery": {
      query: "SELECT a, b, c FROM `project.dataset.table`"
    }
};


function main() {
  var queryJob = {
    useLegacySql: false,
    query: config.bigquery.query
  };

  sendQuery_(queryJob, callbackFunctionToProcessData_)
}


/*
 *  queryJob: Expects an QueryRequest object, only required field is "query"
 *            https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query#QueryRequest
 *  callback: This function will get the results from Big Query as a object:
 *            {
 *              "headers": [],
 *              "data": [[],],
 *            }
 */
function sendQuery_(queryJob, callback) {
  var queryResults = BigQuery.Jobs.query(queryJob, config.gcp.project);
  var jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = BigQuery.Jobs.getQueryResults(config.gcp.project, jobId);
  }

  // Get all the rows of results.
  var rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(config.gcp.project, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows);
  }

  if (rows) {
    // get the headers
    var headers = queryResults.schema.fields.map((field) => field.name);

    // get the data
    var data = rows.map((row) => row.f.map((cols) => cols.v));

    callback({
      headers: headers,
      rows: data
    });
  } else {
    Logger.log('No rows returned.');
  }
}


function callbackFunctionToProcessData_(data) {}
