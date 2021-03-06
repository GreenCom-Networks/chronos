import {observable} from 'mobx'
import JsonModel from '../models/JsonModel'
import Constants from '../services/Constants'

export class JsonStore {
  @observable isLoading = false
  @observable job = null
  @observable submitError = ""
  @observable submitStatus = ""
  @observable value = ""

  loadJob(jobName) {
    this.isLoading = true
    var otherThis = this
    $.getJSON(Constants.chronos.apiUrl + 'v1/scheduler/job/' + encodeURIComponent(jobName)).done(function(resp) {
      var serverJobNames = new Set()
      otherThis.job = JsonModel.fromJS(this, resp)
      otherThis.isLoading = false
    }).fail(function() {
      otherThis.isLoading = false
    })
  }
}
