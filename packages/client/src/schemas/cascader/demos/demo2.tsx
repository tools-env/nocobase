import React from 'react';
import { SchemaRenderer } from '../..';
import { CascaderOptionType } from 'antd/lib/cascader';
import { ArrayField } from '@formily/core';
import { action } from '@formily/reactive';
import { uid } from '@formily/shared';
import { useField } from '@formily/react';
import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Resource } from '@nocobase/client/src/resource';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    isLeaf: false,
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    isLeaf: false,
  },
];

const schema = {
  type: 'object',
  properties: {
    input: {
      type: 'string',
      title: `编辑模式`,
      name: 'name1',
      // enum: options,
      'x-decorator': 'FormItem',
      'x-component': 'Cascader',
      'x-component-props': {
        changeOnSelect: true,
        loadData: '{{ loadData }}',
        useDataSource: '{{ useDataSource }}',
        labelInValue: true,
        fieldNames: {
          label: 'name',
          value: 'code',
          children: 'children',
        },
        // changeOnSelect: true,
      },
      'x-reactions': [
        // '{{useAsyncDataSource(loadOptions)}}',
        {
          target: 'read',
          fulfill: {
            state: {
              value: '{{$self.value}}',
            },
          },
        },
      ],
    },
    read: {
      type: 'string',
      title: `阅读模式`,
      enum: options,
      name: 'name2',
      'x-read-pretty': true,
      'x-decorator': 'FormItem',
      'x-component': 'Cascader',
      'x-component-props': {
        changeOnSelect: true,
        loadData: '{{ loadData }}',
        useDataSource: '{{ useDataSource }}',
        labelInValue: true,
        fieldNames: {
          label: 'name',
          value: 'code',
          children: 'children',
        },
      },
    },
  },
};

const useDataSource = ({ onSuccess }) => {
  const field = useField<ArrayField>();
  const maxLevel = field.componentProps.maxLevel || 3;
  const resource = Resource.make('china_regions');
  useRequest(
    () =>
      resource.list({
        perPage: -1,
        filter: {
          level: 1,
        },
      }),
    {
      formatResult: (data) =>
        data?.data?.map((item) => {
          if (maxLevel !== 1) {
            item.isLeaf = false;
          }
          return item;
        }),
      onSuccess,
    },
  );
};

const loadData = (selectedOptions: CascaderOptionType[], field: ArrayField) => {
  const maxLevel = field.componentProps.maxLevel || 3;
  const targetOption = selectedOptions[selectedOptions.length - 1];
  targetOption.loading = true;
  const resource = Resource.make('china_regions');
  resource
    .list({
      perPage: -1,
      filter: {
        parent_code: targetOption['code'],
      },
    })
    .then((data) => {
      targetOption.loading = false;
      targetOption.children =
        data?.data?.map((item) => {
          if (maxLevel > item.level) {
            item.isLeaf = false;
          }
          return item;
        }) || [];
      field.dataSource = [...field.dataSource];
    });
};

export default () => {
  return (
    <SchemaRenderer debug scope={{ useDataSource, loadData }} schema={schema} />
  );
};