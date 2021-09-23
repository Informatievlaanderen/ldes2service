export interface IArchiveExtension {
  provision: () => Promise<void>;
  pushToStorage: (entity: string) => Promise<void>;
}
