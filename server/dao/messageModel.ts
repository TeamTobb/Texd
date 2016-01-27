/// <reference path="../../typings/tsd.d.ts"/>​

'use strict';

interface Message {
	name: string;
	message: string;
	senderId: string;
}

export class UserMessage implements Message {
	private data: { name: string; message: string, senderId: string };

	constructor(payload: string) {
		var data = JSON.parse(payload);

		if (!data.name || !data.message || !data.senderId) {
			throw new Error('Invalid message payload received: ' + payload);
		}
		this.data = data;
	}

	get name(): string {
		return this.data.name;
	}

	get message(): string {
		return this.data.message;
	}

	get senderId(): string {
		return this.data.senderId;
	}
}
