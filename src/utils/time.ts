import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsDuration from 'dayjs/plugin/duration';
import dayjsLocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsDuration);
dayjs.extend(dayjsLocalizedFormat);
dayjs().format('L LT');
