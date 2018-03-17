import { OrderrByPipe } from './order-by.pipe';
import { EmbeddedCodePipe } from './embedded-code.pipe';
import { PageStatusPipe } from './page-status.pipe';
import { PageTypeByLangPipe } from './page-type-by-lang.pipe';

const COMMON_PIPES = [
    OrderrByPipe,
    EmbeddedCodePipe,
    PageStatusPipe,
    PageTypeByLangPipe
];
export {
    COMMON_PIPES
};
