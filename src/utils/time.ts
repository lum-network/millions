import dayjs from 'dayjs';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsDuration from 'dayjs/plugin/duration';

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsDuration);
