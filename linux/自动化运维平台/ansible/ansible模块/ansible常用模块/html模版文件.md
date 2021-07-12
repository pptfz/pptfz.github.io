

<!DOCTYPE html>
<html>
<head>
 <title></title>
</head>
<body>
 <table border=1>
  <tr>
      <th>参数</th>
      <th colspan="2">说明</th>
  </tr >
  <tr >
      <td>src</td>
      <td colspan="2">指定要挂载的内容</td>
  </tr>
  <tr >
      <td>path</td>
      <td colspan="2">本地挂载点</td>
  </tr>
  <tr >
      <td>fstype</td>
      <td colspan="2">挂载类型</td>
  </tr> 
  <tr>
      <td>opts</td>
      <td colspan="2">挂载权限</td>
  </tr>
   <tr>
      <td rowspan="7">state</td>
      <td>present</td>
      <td>开机挂载，仅将挂载配置写入/etc/fstab</td>
  </tr>
   <tr>
      <td>mounted</td>
      <td>挂载设备，并将配置写入/etc/fstab</td>
  </tr>
   <tr>
      <td>unmounted</td>
      <td>卸载设备，不会清除/etc/fstab写入的配置</td>
  </tr>
   <tr>
      <td>absent</td>
      <td>卸载设备，会清理/etc/fstab写入的配置</td>
  </tr>
 </table>
</body>
<style type="text/css">
 table{
  border-collapse:collapse
 }
 tr,td{
  border:1px solid #333;
 }
</style>
</html>
