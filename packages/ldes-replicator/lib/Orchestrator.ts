import { Readable } from "stream";
import { IState, IWritableConnector } from "@ldes/types";

/**
 * An Orchestrator will handle the synchronization of the Linked Data Event Stream.
 * It initializes the connectors
 */
export class Orchestrator {
    private connectors: Array<IWritableConnector>;
    private stateStore: IState;
    private ldes: Readable;

    constructor(connectors: Array<IWritableConnector>, stateStore: IState, ldes: Readable){
        this.connectors = connectors;
        this.stateStore = stateStore;
        this.ldes = ldes;   // Implement read() function of the ldes?
    }

    /**
     * Start listening to the events and pipe them to the connectors
     */
    run(): void {}

    /**
     * Run provision function of all connectors
     */
    privision(): void {}

    /**
     * Reset the state 
     */
    reset(): void {}
}