// src/common/storage/StorageDriver.js

export class StorageDriver {
  get(_key) {
    throw new Error("StorageDriver.get not implemented");
  }

  set(_key, _value) {
    throw new Error("StorageDriver.set not implemented");
  }

  remove(_key) {
    throw new Error("StorageDriver.remove not implemented");
  }

  list(_prefix) {
    throw new Error("StorageDriver.list not implemented");
  }

  clear(_prefix) {
    throw new Error("StorageDriver.clear not implemented");
  }
}

