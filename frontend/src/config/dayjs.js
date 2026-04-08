import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/pt-br';

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.locale('pt-br');

export default dayjs;
