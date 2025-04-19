
import { CollectionState } from '../../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class PlayerCollectionService {
  constructor(private p: any) {}

  initializeCollectionState(): CollectionState {
    return {
      isCollectingCanister: false,
      canisterCollectionProgress: 0,
      canisterCollectionTarget: null,
      isRefuelingHoverbike: false,
      refuelingProgress: 0,
      isRepairingHoverbike: false,
      repairProgress: 0,
      droppingCanister: false
    };
  }

  handleCollectionMovementCancellation(state: CollectionState, velX: number, velY: number): void {
    if (state.isCollectingCanister && 
        (Math.abs(velX) > 0.3 || Math.abs(velY) > 0.3)) {
      state.isCollectingCanister = false;
      state.canisterCollectionProgress = 0;
      state.canisterCollectionTarget = null;
    }
  }

  handleFuelCollectionAnimation(state: CollectionState): void {
    if (state.isCollectingCanister && state.canisterCollectionTarget) {
      state.canisterCollectionProgress = Math.min(1, state.canisterCollectionProgress + 0.0025);
    }
  }
}
