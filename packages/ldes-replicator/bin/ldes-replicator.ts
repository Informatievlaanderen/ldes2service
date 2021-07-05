/**
 * CLI interface where manual dependency injection happens
 */

import { DummyConnector } from "@ldes/ldes-dummy-connector";
import { DummyState } from "../../ldes-dummy-state";

const connector = new DummyConnector();
const state = new DummyState();
