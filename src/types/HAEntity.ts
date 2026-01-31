import { type HassEntity } from 'home-assistant-js-websocket'

export interface HAEntity extends HassEntity {
  domain: string
}
