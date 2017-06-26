import React from 'react'
import {observer} from 'mobx-react'

@observer
class JobDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    console.log(this.props);
  }

  render() {
    const store = this.props.jsonStore;
    let fieldsGroup = [];
    if (!store.isLoading && store.job) {
      console.log(JSON.parse(JSON.stringify(store.job.json)))
      fieldsGroup = [
        [
          {
            key: "Name",
            value: store.job.json.name
          },
          {
            key: "Schedule",
            value: store.job.json.schedule
          },
          {
            key: "Command",
            value: store.job.json.command
          }
        ],
        [
          {
            key: "Cpu",
            value: store.job.json.cpus
          },
          {
            key: "Memory",
            value: store.job.json.mem
          },
          {
            key: "Disk",
            value: store.job.json.disk
          }
        ],
        [
          {
            key: "Container image",
            value: store.job.json.container ? store.job.json.container.image : ''
          }
        ],
        [
          {
            key: 'Current state',
            value: new Date(store.job.json.lastSuccess || "2000-01-01T00:00:00.000Z") > new Date(store.job.json.lastError || "2000-01-01T00:00:00.000Z") ? 'success' : 'error'
          },
          {
            key: 'Last success',
            value: store.job.json.lastSuccess
          },
          {
            key: 'Last error',
            value: store.job.json.lastError
          }
        ]
      ]
    }

    return (
      <div className="modal fade in job-details-modal" id="job-details-modal" role="dialog"
           aria-labelledby="job-details-modal-label">
        <div className="modal-dialog custom-modal" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span
                aria-hidden="true">&times;</span></button>
              <h4 className="modal-title" id="job-details-modal-label">Details</h4>
            </div>
            <div className="modal-body">
              {
                (store.isLoading || !store.job) ? (
                  <div>
                    <p>Loading...</p>
                  </div>
                ) : (
                  fieldsGroup.map(fields => {
                    return (
                      <div className="panel-group">
                        <div className="panel-body">
                          {
                            fields.map(field => {
                              return (
                                <div className="keyVal">
                                  <label className="control-label col-sm-1">{field.key}</label>
                                  <div className="col-sm-3">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={field.value}
                                    />
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    )
                  })
                )
              }

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default observer(JobDetails);
