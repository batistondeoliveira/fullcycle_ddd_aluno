class Customer {
  _id: string = "";
  _name: string = "";
  _address: string = "";
  _active: boolean = false;

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get address(): string {
    return this._address;
  }

  get active(): boolean {
    return this._active;
  }

  set name(name : string) {
    this._name = name;
  }

  set address(address : string) {
    this._address = address;
  }

  set active(active : boolean) {
    this._active = active;
  }
}