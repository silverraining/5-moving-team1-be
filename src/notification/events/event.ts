export class TargetMoverUpdatedEvent {
  constructor(
    public readonly requestId: string,
    public readonly moverId: string,
  ) {}
}
