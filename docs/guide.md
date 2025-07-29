## ServerSync 1 2 3

### 那是什么？

一个独立于 mc 本体的 java 应用程序，用以从指定的服务端拉取最新的文件。  
彻底免去每次更新下载客户端和迁移配置文件的操作。  

### 基本食用指南

获取到的客户端应当为如下结构：  
```
├─scex zen server ver3.0[RAW]
│  ├─.minecraft
│  ├─PCL
│  ├─Plain Craft Launcher 2.exe
│  ├─serversync-4.2.0.jar
│  ├─sync.cmd
```

运行`sync.cmd`，即弹出一个控制台窗口，并输出：  
```
[7月 29, 2025 10:48:25][ServerSync] 信息: Root dir: D:\.A1_programs\scex zen server ver3.0[RAW]\.minecraft\versions\1.20.1-Forge_47.2.20
[7月 29, 2025 10:48:25][ServerSync] 信息: Running version: v4.2.0
[7月 29, 2025 10:48:25][ServerSync] 信息: Loading language file: zh_CN
[7月 29, 2025 10:48:25][ServerSync] 信息: < 正在连接服务器... >

//只是一个范例，实际输出内容在日志时间头，路径等会有差别，但大体结构类似
```

如果服务端在线，数秒后 sync 将开始进行同步操作。  
当出现`按任意键继续...`或`Press any key to continue...`时，同步操作完成，可以关闭此窗口并正常启动客户端了。  

若第一次启动即按预期运行，对您来说这份文档看到这里就足够了。  
后续只需要在服务器有更新时在启动前简单运行一次 sync，即可完成客户端的更新操作。  

对于没有按预期输出日志的情况，说明 sync 运行不正确。按输出状态不同转到下列情况进行修复。   
一般地，这些修复操作只需要执行一次。  

### 常见错误表现及修复方案

#### 1：服务器相关问题

典型的日志输出：  
```
[7月 29, 2025 11:02:25][ServerSync] 信息: Root dir: D:\.A1_programs\scex zen server ver3.0[RAW]\.minecraft\versions\1.20.1-Forge_47.2.20
[7月 29, 2025 11:02:25][ServerSync] 信息: Running version: v4.2.0
[7月 29, 2025 11:02:25][ServerSync] 信息: Loading language file: zh_CN
[7月 29, 2025 11:02:25][ServerSync] 信息: < 正在连接服务器... >
[7月 29, 2025 11:02:32][ServerSync] 严重: 无法连接到服务器: 219.144.85.12:49775
java.lang.Exception: Failed to connect to server
        at com.superzanti.serversync.client.ClientWorker.connect(ClientWorker.java:66)
        at com.superzanti.serversync.ServerSync.runInClientMode(ServerSync.java:138)
        at com.superzanti.serversync.ServerSync.call(ServerSync.java:73)
        at com.superzanti.serversync.ServerSync.call(ServerSync.java:25)
        at picocli.CommandLine.executeUserObject(CommandLine.java:1853)
        at picocli.CommandLine.access$1100(CommandLine.java:145)
        at picocli.CommandLine$RunLast.executeUserObjectOfLastSubcommandWithSameParent(CommandLine.java:2255)
        at picocli.CommandLine$RunLast.handle(CommandLine.java:2249)
        at picocli.CommandLine$RunLast.handle(CommandLine.java:2213)
        at picocli.CommandLine$AbstractParseResultHandler.execute(CommandLine.java:2080)
        at picocli.CommandLine.execute(CommandLine.java:1978)
        at com.superzanti.serversync.ServerSync.main(ServerSync.java:61)
请按任意键继续. . .
```

这种情况下 sync 能够正确运行，但没能与服务端链接。  
检查设备网络链接状况，若本设备网络链接正常即为服务端宕机，~~压力腐竹即可~~联系服务器管理查看服务器状态。

#### 2：sync 运行相关问题

典型的日志输出：  
```
无法将“java”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的拼写，如果包括路径，请确保路径正确，然后
再试一次。
```

有时控制台窗口出现但没有任何日志输出，也属于此种情况。  

这种情况下 sync 没能正常运行，常见的原因是未正确配置环境变量*  
> 输出日志表明计算机不能理解批处理文件中`java`的含义，因此需要配置环境变量使计算机理解此命令指向的程序文件。  

有关配置环境变量的教程可很轻松地在互联网上寻得。  
同时，服务端根目录附带了一份 win11 环境下配置 java 环境变量的图文教程，可作为参考。`JDKenv.pdf`  

对于此文档未列明的错误情况，可随运行情况相关截图一同向服务器管理员寻求帮助。





