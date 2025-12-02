export interface ScheduleResponse {
    status: number;
    schedule: any;
};

export interface ScheduleEvent {
  RoundNumber: number;
  Country: string;
  Location: string;
  OfficialEventName: string;
  EventDate: string;
  EventName: string;
  EventFormat: string;
  Session1: string;
  Session1Date: string;
  Session2: string;
  Session2Date: string;
  Session3: string;
  Session3Date: string;
  Session4: string;
  Session4Date: string;
  Session5: string;
  Session5Date: string;
  F1ApiSupport: boolean;
}