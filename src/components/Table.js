import React from 'react';
import { Button, Tooltip } from 'shadcn-ui';

export function DataTable({ columns, data }) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.accessor}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {column.Header}
            </th>
          ))}
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td
                key={column.accessor}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
              >
                {row[column.accessor]}
              </td>
            ))}
            <td className="px-6 py-4">
              <Tooltip content="Edit this entry">
                <Button variant="primary" className="mr-2">
                  Edit
                </Button>
              </Tooltip>
              <Tooltip content="Delete this entry">
                <Button variant="destructive">Delete</Button>
              </Tooltip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
