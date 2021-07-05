import { Url } from "url";

export interface IReadableConnector {
    /**
     * Get the object corresponding to the version URI
     * @param versionUri 
     */
    getVersion(versionUri: Url): any;

    /**
     * Returns the latest version of a concept URI
     * @param conceptUri 
     */
    getLatestVersion(conceptUri: Url): any;

    /**
     * Return all versions of a concept URI
     * @param conceptUri 
     */
    getAllVersions(conceptUri: Url): Array<any>;

    /**
     * Return the latest version URI of a concept URI
     * @param conceptUri 
     */
    getLatestVersionUri(conceptUri: Url): Url;

    /**
     * Return all versions URIs corresponding to a concept URI
     * @param conceptUri 
     */
    getAllVersionUris(conceptUri: Url): Array<Url>;
}