import { Injectable } from "@angular/core";
import { CLOUDINARY } from "constant";
import {
    Http,
    Response,
    Headers,
    RequestOptions,
    ResponseContentType
} from "@angular/http";
import { Observable } from "rxjs/Observable";
import { getEndpoint } from "configs";
import { CloudinarySearchCriteria, ImageInfo } from 'models';
import { FileUploaderOptions, FileUploader, FileItem } from 'ng2-file-upload';
import { ImageUploadWidgetImageInfo } from "components/imageUploadWidget";

/**
 * Wrapper for Cloudinary service
 * CloudinaryService
 */

@Injectable()
export class CloudinaryService {
    constructor(private http: Http) {}

    getCloudinary(): any {
        return window["cloudinary"];
    }

    getUploader(option?){
      option = option || {};
      option = Object.assign({...this.getDefaultOption()}, option);
      const uploaderOptions: FileUploaderOptions = {
        url: CLOUDINARY.PROTOCOL + CLOUDINARY.API_URL + CLOUDINARY.CLOUD_NAME + '/upload',
        autoUpload: true,
        isHTML5: true,
        removeAfterUpload: true,
        headers: [
          {
            name: 'X-Requested-With',
            value: 'XMLHttpRequest'
          }
        ],
        allowedFileType:  option.allowedFileType,
        maxFileSize: option.maxFileSize
      };

      let uploader = new FileUploader(uploaderOptions);
      uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
        form.append('cloud_name', CLOUDINARY.CLOUD_NAME);
        form.append('upload_preset', CLOUDINARY.UPLOAD_PRESET);
        fileItem.withCredentials = false;
        return { fileItem, form };
      };
      return uploader;
    }

    getDefaultOption(){
        return {
            multiple: false,
            minFileSize: CLOUDINARY.MIN_FILE_SIZE,
            maxFileSize: CLOUDINARY.MAX_FILE_SIZE,
        }
    }

    buildImageInfo(fileItemData: any,
                  isDefault: boolean,
                  tagToPages:any,
                  savedMetadata: any): ImageUploadWidgetImageInfo{

      const urls = this.transformImageURL(
        fileItemData.public_id,
        fileItemData.format,
        fileItemData.version
      );
      return {
          damId: fileItemData.public_id,
          url: urls.urlOriginal,
          url16_9: urls.url16_9,
          url16_16: urls.url16_16,
          url27_40: urls.url27_40,
          isDefault: isDefault,
          tagToPages: tagToPages,
          properties: {
              fileType: fileItemData.format,
              version: fileItemData.version
          },
          metadata: savedMetadata
      };
    }

    createTransformedURL(
        fileName: string,
        fileType: string,
        version: number,
        transformObject?: Object
    ): string {
        const folderURL = this.getCloudinaryFolderURL();
        let transformString = this.getTransformString(transformObject);
        transformString += transformString ? "/" : "";
        return `${folderURL}${transformString}v${version}/${fileName}.${fileType}`;
    }

    getCloudinaryFolderURL() {
        return `${CLOUDINARY.PROTOCOL}${CLOUDINARY.DOMAIN}/${CLOUDINARY.CLOUD_NAME}/${CLOUDINARY.FOLDER}/`;
    }

    getImageTypeAndSize(url: string) {
        const headers = new Headers();
        headers.append("Content-Type", "text/plain");
        return this.http
            .get(url, { responseType: ResponseContentType.Blob, headers })
            .map((resp: Response) => ({
                size: resp["size"],
                type: resp["type"]
            }));
    }

    searchImageFromDam (searchCriteria: CloudinarySearchCriteria) {
      const params = {params : searchCriteria};
      return this.http.get('/cloudinary/search', params);
      //for local
      //return this.http.get('http://localhost:8080/cloudinary/search', params);
    }

    private getTransformString(transformObject): string {
        if (!transformObject) {
            return "";
        }
        let array = [];
        for (var key in transformObject) {
            let value = transformObject[key];
            switch (key) {
                case "width":
                    array.push("w_" + value);
                    break;
                case "height":
                    array.push("h_" + value);
                    break;
                case "crop":
                    array.push("c_" + value);
                    break;
                case "aspectRatio":
                    array.push("ar_" + value);
                    break;
                case "gravity":
                    array.push("g_" + value);
                    break;
            }
        }
        return array.join(",");
    }

    /**
     * @description tranfrom 1 image into 4 url respectively to 4 ratios (16:9, 16:16, 27:40, original)
     *
     * @param fileName file name (public-id) of image in cloudinary
     * @param fileType file type of image in cloudinary
     * @param version version (timestamp) of image that saved in cloudinary
     */
    public transformImageURL(fileName: string, fileType: string, version: number) {
        const url16_9 = this.createTransformedURL(
            fileName, fileType, version,
            { crop: "fill", gravity: "faces", aspectRatio: "16:9", }
        );
        const url16_16 = this.createTransformedURL(
            fileName, fileType, version,
            { crop: "fill", gravity: "faces", aspectRatio: "16:16", }
        );
        const url27_40 = this.createTransformedURL(
            fileName, fileType, version,
            { crop: "fill", gravity: "faces", aspectRatio: "27:40", }
        );
        const urlOriginal = this.createTransformedURL(
            fileName, fileType, version
        );
        return { urlOriginal, url16_9, url16_16, url27_40 };
    }
}


