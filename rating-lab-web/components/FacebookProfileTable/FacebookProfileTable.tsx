import { Avatar, Table, Group, Text, ScrollArea } from "@mantine/core";

interface UsersTableProps {
  data: {
    name: string;
    email: string;
    dob: string;
    picture: string;
    album: string;
  }[];
}

export function FacebookProfileTable({ data }: UsersTableProps) {
  const rows = data.map((item) => (
    <tr key={item.name}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={item.picture} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </td>
      <td>{item.dob}</td>
      <td>
        <Avatar size={40} src={item.album} radius={40} />
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={800} verticalSpacing="sm">
        <thead>
          <tr>
            <th>Employee</th>
            <th>DOB</th>
            <th>Album</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
