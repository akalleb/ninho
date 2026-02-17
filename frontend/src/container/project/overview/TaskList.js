'use client';

import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Table } from 'antd';
import { Button } from '../../../components/buttons/buttons';
import { Dropdown } from '../../../components/dropdown/dropdown';
import { TasklistAction } from '../style';
import { getImageUrl } from '../../../utility/getImageUrl';

function TaskList() {
  const [state, setState] = useState({
    selectedRowKeys: [],
    selectedRows: [],
  });

  return (
    <div className="task-list-inner table-responsive">
      <Table pagination={false} dataSource={[]} columns={[]} />
      <div className="tasklist-action">
        <Button type="primary" size="large" transparented>
          <FeatherIcon icon="plus" size="14" /> Adicionar nova tarefa
        </Button>
      </div>
    </div>
  );
}

export default TaskList;
