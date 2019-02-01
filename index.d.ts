import React, { Component } from "react"

declare module "react-native-email-link" {

    type InboxOptions = {
        app?: string | undefined | null,
        title: string,
        message: string,
        cancelLabel: string,
        recipient?: string | undefined | null,
        subject?: string | undefined | null
    }

    export function openInbox(options: InboxOptions): Promise<void>;
}
