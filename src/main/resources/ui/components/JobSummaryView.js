import React from 'react'
import {observer} from 'mobx-react'
import $ from 'jquery'
import 'bootstrap'
import {JsonStore} from '../stores/JsonStore'
import JsonEditor from './JsonEditor'
import JobDetails from './JobDetails';
import JobConfirmDeletion from './JobConfirmDeletion'

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

@observer
class JobSummaryView extends React.Component {
  jsonStore = new JsonStore()

  constructor(props) {
    super(props);

    this.state = {
      jobs: this.props.jobs,
      currentFilter: "name",
      reverseFilterOrder: null,
      jobToDelete: {},
      selectedFolder: null
    };
  }

  componentWillReceiveProps(props) {
    if (props.jobs.length !== this.state.jobs.length) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.setState({
          jobs: props.jobs.sort((a, b) => {
            return a[this.state.currentFilter] < b[this.state.currentFilter] ? -1 : 1;
          })
        });
      }, 200);
    }
  }

  disabledWrap(job, value) {
    if (job.disabled) {
      return (
        <s>{value}</s>
      )
    } else {
      return (
        value
      )
    }
  }

  getNameTd(job) {
    if (job.disabled) {
      return (
        <td data-container="body" data-toggle="tooltip" data-placement="top" title="Job is disabled"><s>{job.name}</s>
        </td>
      )
    } else {
      return (
        <td>
          <span onClick={() => {
            this.showJobDetails(job);
          }} className="jobName">
            {job.name}
          </span>
        </td>
      )
    }
  }

  selectFolder(folder) {
    console.log(folder)
    this.setState({selectedFolder: folder})
  }

  renderJobFolder(folder) {
    return (
      <tr key={folder} className="folder" onClick={this.selectFolder.bind(this, folder)}>
        <td>
          <i className="fa fa-folder" aria-hidden="true"/> {folder}
        </td>
        <td data-container="body" data-toggle="tooltip" data-placement="top"/>
        <td/>
        <td/>
        <td>
        </td>
      </tr>
    );
  }

  renderJob(job) {
    return (
      <tr key={job.name}>
        {this.getNameTd(job)}
        <td className={job.nextExpected === 'OVERDUE' ? 'danger' : null} data-container="body" data-toggle="tooltip"
            data-placement="top" title={job.schedule}>{job.nextExpected}</td>
        <td className={this.getStatusClass(job)}>{job.status}</td>
        <td className={this.getStateClass(job)}>{job.state}</td>
        <td className="text-right">
          <div className="btn-group" role="group" aria-label="Left Align">
            <button
              type="button"
              onClick={(event) => this.runJob(event, job)}
              className="btn btn-success btn-secondary"
              aria-label="Run"
              data-loading-text='<i class="fa fa-spinner fa-pulse fa-fw"/>'
              autoComplete="off"
              title="Run">
              <i className="fa fa-play" aria-hidden="true"/>
            </button>
            <button
              type="button"
              className="btn btn-info"
              aria-label="Edit"
              onClick={() => this.editJob(job)}
              title="Edit">
              <i className="fa fa-pencil-square-o" aria-hidden="true"/>
            </button>
            <button
              type="button"
              className="btn btn-warning"
              aria-label="Stop"
              data-loading-text='<i class="fa fa-spinner fa-pulse fa-fw"/>'
              onClick={(event) => this.stopJob(event, job)}
              title="Stop">
              <i className="fa fa-stop" aria-hidden="true"/>
            </button>
            <button
              type="button"
              className="btn btn-danger"
              aria-label="Delete"
              data-loading-text='<i class="fa fa-spinner fa-pulse fa-fw"/>'
              onClick={(event) => this.deleteJob(this, job)}
              title="Delete">
              <i className="fa fa-times" aria-hidden="true"/>
            </button>
          </div>
        </td>
      </tr>
    )
  }

  backToRootFolder(){
    this.setState({selectedFolder: null});
  }

  render() {
    let jobsByCustomer = {};
    let othersJob = [];
    this.state.jobs.forEach(job => {
      let splittedJobName = job.name.split('_');
      let customer = splittedJobName[0];
      let codename = splittedJobName[1];
      if (customer && codename) {
        if (!jobsByCustomer[customer]) {
          jobsByCustomer[customer] = [];
        }

        jobsByCustomer[customer].push(job);
      } else {
        othersJob.push(job);
      }
    });
    return (
      <div className="jobSummaryView">
        <div className="table-responsive">
          <table className="table table-striped table-hover table-condensed">
            <thead>
            <tr>
              <th onClick={() => {
                this.filterColumn('name')
              }}
                  className={this.getFilterClassName('name')}>
                JOB
              </th>
              <th onClick={() => {
                this.filterColumn('schedule')
              }}
                  className={this.getFilterClassName('schedule')}>
                NEXT RUN
              </th>
              <th onClick={() => {
                this.filterColumn('status')
              }}
                  className={this.getFilterClassName('status')}>
                STATUS
              </th>
              <th onClick={() => {
                this.filterColumn('state')
              }}
                  className={this.getFilterClassName('state')}>
                STATE
              </th>
              <th className="text-right">ACTIONS</th>
            </tr>
            </thead>
            <tbody>
            {this.state.selectedFolder && (
              <tr className="folder" onClick={this.backToRootFolder.bind(this)}>
                <td>
                  <i className="fa fa-folder" aria-hidden="true"/> ..
                </td>
                <td data-container="body" data-toggle="tooltip" data-placement="top"/>
                <td/>
                <td/>
                <td>
                </td>
              </tr>
            )}

            {this.state.selectedFolder ? (
              Object.values(jobsByCustomer).filter(jobs => jobs[0].name.split('_')[0] === this.state.selectedFolder)[0].map(job => this.renderJob(job))
            ) : (
              Object.keys(jobsByCustomer).map(customer => this.renderJobFolder(customer))
            )}

            {!this.state.selectedFolder && othersJob.map(job => this.renderJob(job))}
            </tbody>
          </table>
        </div>
        <JsonEditor jsonStore={this.jsonStore}/>
        <JobDetails jsonStore={this.jsonStore}/>
        <JobConfirmDeletion jobToDelete={this.state.jobToDelete} callback={this.deleteJobCallback.bind(this)}
                            doRequest={this.doRequest}/>
      </div>
    )
  }

  getFilterClassName(column) {
    if (this.state.currentFilter === column && !this.state.reverseFilterOrder) {
      return "filter"
    } else if (this.state.currentFilter === column) {
      return "filterReverse"
    }
  }

  getStatusClass(job) {
    if (job.status === 'success') {
      return 'success'
    }
    if (job.status === 'failure') {
      return 'warning'
    }
    return ''
  }

  getStateClass(job) {
    if (job.state.match(/\d+ running/)) {
      return 'running'
    }
    if (job.state === 'queued') {
      return 'queued'
    }
    return ''
  }

  doRequest(target, method, url, success, fail) {
    var btn = $(target).button('loading')
    $.ajax({
      type: method,
      url: url,
    }).done(function (resp) {
      setTimeout(function () {
        btn.button('reset')
        if (success) {
          success()
        }
      }, 500)
    }).fail(function (resp) {
      setTimeout(function () {
        btn.button('reset')
        if (fail) {
          fail(resp)
        }
      }, 500)
    })
  }

  runJob(event, job) {
    this.doRequest(
      event.currentTarget,
      'PUT',
      'v1/scheduler/job/' + encodeURIComponent(job.name)
    )
  }

  stopJob(event, job) {
    this.doRequest(
      event.currentTarget,
      'DELETE',
      'v1/scheduler/task/kill/' + encodeURIComponent(job.name)
    )
  }

  deleteJob(event, job) {
    this.setState({
      jobToDelete: {
        event,
        job
      }
    });
    $('#job-confirm-deletion-modal').modal('show');
  }

  deleteJobCallback(job) {
    console.log("deleted job " + job)
  }

  editJob(job) {
    this.jsonStore.loadJob(job.name)
    $('#json-modal').modal('show')
  }

  showJobDetails(job) {
    this.jsonStore.loadJob(job.name, false)
    $('#job-details-modal').modal('show')
  }

  filterColumn(column) {
    let reverseFilterOrder = false;
    let filteredJobs = this.state.jobs.sort((a, b) => {
      return a[column] < b[column] ? -1 : 1;
    });

    //sort in reverse order in case of second click on the same column
    if (this.state.currentFilter === column && !this.state.reverseFilterOrder) {
      filteredJobs = filteredJobs.reverse();
      reverseFilterOrder = !this.state.reverseFilterOrder;
    }

    this.setState({
      jobs: filteredJobs,
      currentFilter: column,
      reverseFilterOrder: reverseFilterOrder
    })
  }
}

JobSummaryView.propTypes = {
  jobs: React.PropTypes.object.isRequired
}

export default JobSummaryView
