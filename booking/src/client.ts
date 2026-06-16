import { events, type IEvents } from './models/event';

export class Client {
  private baseUrl;

  public constructor(baseUrl: string) {
    this.baseUrl = new URL(baseUrl);
  }

  public async getEvents(): Promise<IEvents> {
    const response = await fetch(new URL('events', this.baseUrl));
    const body = await response.json();
    return events.parse(body);
  }
}
