import {observable, computed} from 'mobx';

export default class JsonModel {
  name
  @observable json

  constructor(store, name, json) {
    this.store = store
    this.name = name
    this.json = json
  }

  static fromJS(store, json) {
    return new JsonModel(
      store,
      json.name,
      json
    )
  }
}
