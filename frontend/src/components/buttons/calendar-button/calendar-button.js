import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { Popover } from '../../popup/popup';
import { DateRangePickerOne } from '../../datePicker/datePicker';
import { Button } from '../buttons';

const CalendarButtonPageHeader = () => {
  const content = (
    <>
      <DateRangePickerOne />
    </>
  );

  return (
    <Popover placement="bottomRight" title="Buscar por datas" content={content} action="hover">
      <Button size="small" type="white">
        <FeatherIcon icon="calendar" size={14} />
        Calendário
      </Button>
    </Popover>
  );
};

export { CalendarButtonPageHeader };
