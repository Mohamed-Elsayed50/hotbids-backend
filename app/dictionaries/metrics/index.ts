export enum MetricTypes {
    liveAuctions = 'Live auctions',
    pendingApproval = 'Pending approval',
    newMessage = 'New message',
    autionClosedToday = 'Auction closed today',
    userOnline = 'User online',
    newRegisteredUser = 'New registered user',
    todaySales = `Today's sales`,
    carsSoldToday = 'Cars sold today'
}

export enum MetricThemes {
    success = 'success',
    warning = 'warning',
    red = 'red',
    blue = 'blue',
    blueOne = 'blue-1',
}

export class Metric {
    constructor(
        public readonly id: number,
        public readonly title: MetricTypes,
        public readonly value: number,
        public readonly chartData: Array<number> = [],
        public readonly theme: MetricThemes = MetricThemes.success,
    ) {}
}
