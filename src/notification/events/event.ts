export class TargetMoverUpdatedEvent {
  constructor(
    public readonly requestId: string,
    public readonly moverId: string,
  ) {}
}

export class TargetOfferUpdateEvent {
  constructor(
    public readonly offerId: string,
    public readonly customerId: string,
  ) {}
}

export class OfferComfirmUpdateEvent {
  constructor(
    public readonly moverId: string,
    public readonly offerId: string,
  ) {}
}

export class NewReviewEvent {
  constructor(
    public readonly moverId: string,
    public readonly reveiwId: string,
  ) {}
}

export class MoveCompletionEvent {
  constructor(
    public readonly requestId: string,
    public readonly customerId: string,
  ) {}
}
