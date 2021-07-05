import { IState } from "@ldes/types";
import { Url } from "url";

export class DummyState implements IState {
  private readonly pages: Url[];

  public constructor() {
    this.pages = [];
  }

  public async getLatestPage(): Promise<Url | null> {
    if (this.pages.length > 0) {
      return this.pages[this.pages.length - 1];
    }

    return null;
  }

  public async setLatestPage(page: Url) {
    this.pages.push(page);
  }

  public async getProcessedPaged(): Promise<Url[]> {
    return this.pages;
  }

  public async provision(): Promise<void> {
    // Nothing to provision here
    return;
  }
}
