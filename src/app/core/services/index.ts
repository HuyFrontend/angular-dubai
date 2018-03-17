import { StatusService } from './status.services';
import { AppConfigService } from './app-config.services';
import { PageService } from './page.services';
import { AuthService } from './auth.services';
import { ContentService } from './content.services';
import { PageGroupService } from './page-groups.services';
import { WorkflowService } from './workflow.services';
import { CloudinaryService } from './cloudinary.services';
import { CampaignService } from './campaign.services';
import { AppService } from "services/app.services";

/**
 * Define all services that will be injected in app as global.
*/
const GLOBAL_SERVICES_PROVIDERS = [
    AuthService,
    AppConfigService,
    AppService,
    PageService,
    ContentService,
    PageGroupService,
    WorkflowService,
    StatusService,
    CloudinaryService,
    CampaignService,
];

export {
    AppConfigService,
    PageService,
    AppService,
    AuthService,
    ContentService,
    PageGroupService,
    WorkflowService,
    StatusService,
    CloudinaryService,
    CampaignService,
    GLOBAL_SERVICES_PROVIDERS
}
