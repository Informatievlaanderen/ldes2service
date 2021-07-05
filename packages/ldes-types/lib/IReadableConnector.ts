import type { Url } from 'url';

export interface IReadableConnector {
  /**
   * Get the object corresponding to the version URI
   * @param versionUri
   */
  getVersion: (versionUri: Url) => Promise<any>;

  /**
   * Returns the latest version of a concept URI
   * @param conceptUri
   */
  getLatestVersion: (conceptUri: Url) => Promise<any>;

  /**
   * Return all versions of a concept URI
   * @param conceptUri
   */
  getAllVersions: (conceptUri: Url) => Promise<any[]>;

  /**
   * Return the latest version URI of a concept URI
   * @param conceptUri
   */
  getLatestVersionUri: (conceptUri: Url) => Promise<Url>;

  /**
   * Return all versions URIs corresponding to a concept URI
   * @param conceptUri
   */
  getAllVersionUris: (conceptUri: Url) => Promise<Url[]>;
}
