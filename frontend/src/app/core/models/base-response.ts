export class BaseResponse<T> {

  constructor(
    public data: T,
    public messages: Array<string>
  ) {
  }

}
