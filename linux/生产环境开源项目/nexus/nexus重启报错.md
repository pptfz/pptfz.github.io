# nexus重启报错

# 1.背景说明

> 公司生产nexus是二进制包方式运行的，并且生产mvn私服和npm私服都是基于nexus的，由于需要做nexus整体迁移，所以在迁移前压缩了一下nexus数据目录 `sonatype-work` ，但是因为磁盘空间不足压缩失败了(整体数据大小为近1T)，然后就删除了压缩的tar包恢复了部分磁盘空间，但是后续一个前端项目打包的时候出现了问题，即执行 `yarn install` 的时候卡住不动了，实际上这个时候nexus虽然进程还在但是实际上已经不能正确提供响应了
>
> 所以手动执行了 `kill -9` 命令杀掉了nexus进程(但是实际上不应该使用kill命令，应该使用 `nexus stop` 命令)
>
> 结果就是在启动nexus的时候就无法启动了



# 2.报错信息

查看 `sonatype-work/nexus3/log/nexus.log` 看到报错日志如下

> 看不懂。。。百度了半天

```shell
2022-01-06 22:46:51,273+0800 WARN  [FelixStartLevel]  *SYSTEM Sisu - Problem removing: org.eclipse.sisu.inject.LazyBeanEntry@1acb1a03 from: org.sonatype.nexus.extender.NexusLifecycleManager@4e6de86f via: org.sonatype.nexus.extender.NexusLifecycleManager$BundleContextMediator@6805c95
com.google.inject.ProvisionException: Unable to provision, see the following errors:

1) null returned by binding at org.eclipse.sisu.wire.LocatorWiring
 but the 5th parameter of com.sonatype.nexus.licensing.ext.internal.NexusLicenseManager.<init>(NexusLicenseManager.java:57) is not @Nullable
  while locating org.sonatype.nexus.common.app.ApplicationDirectories
    for the 5th parameter of com.sonatype.nexus.licensing.ext.internal.NexusLicenseManager.<init>(NexusLicenseManager.java:57)
  at / (via modules: org.sonatype.nexus.extender.modules.NexusBundleModule -> org.eclipse.sisu.space.SpaceModule)
  while locating com.sonatype.nexus.licensing.ext.internal.NexusLicenseManager
  while locating java.lang.Object annotated with *
  at org.eclipse.sisu.wire.LocatorWiring
  while locating com.sonatype.nexus.licensing.ext.LicenseManager
    for the 1st parameter of com.sonatype.nexus.licensing.ext.internal.NexusLicenseInstaller.<init>(NexusLicenseInstaller.java:51)
  at / (via modules: org.sonatype.nexus.extender.modules.NexusBundleModule -> org.eclipse.sisu.space.SpaceModule)
  while locating com.sonatype.nexus.licensing.ext.internal.NexusLicenseInstaller
  while locating java.lang.Object annotated with *

2) null returned by binding at org.eclipse.sisu.wire.LocatorWiring
 but the 2nd parameter of com.sonatype.nexus.licensing.ext.internal.NexusLicenseInstaller.<init>(NexusLicenseInstaller.java:51) is not @Nullable
  while locating org.sonatype.nexus.common.app.ApplicationLicense
    for the 2nd parameter of com.sonatype.nexus.licensing.ext.internal.NexusLicenseInstaller.<init>(NexusLicenseInstaller.java:51)
  at / (via modules: org.sonatype.nexus.extender.modules.NexusBundleModule -> org.eclipse.sisu.space.SpaceModule)
  while locating com.sonatype.nexus.licensing.ext.internal.NexusLicenseInstaller
  while locating java.lang.Object annotated with *

2 errors
	at com.google.inject.internal.InjectorImpl$2.get(InjectorImpl.java:1028)
	at org.eclipse.sisu.inject.LazyBeanEntry.getValue(LazyBeanEntry.java:81)
	at org.sonatype.nexus.extender.NexusLifecycleManager.reindex(NexusLifecycleManager.java:172)
	at org.sonatype.nexus.extender.NexusLifecycleManager.sync(NexusLifecycleManager.java:153)
	at org.sonatype.nexus.extender.NexusLifecycleManager$BundleContextMediator.remove(NexusLifecycleManager.java:265)
	at org.sonatype.nexus.extender.NexusLifecycleManager$BundleContextMediator.remove(NexusLifecycleManager.java:1)
	at org.eclipse.sisu.inject.WatchedBeans.remove(WatchedBeans.java:101)
	at org.eclipse.sisu.inject.InjectorBindings.unsubscribe(InjectorBindings.java:96)
	at org.eclipse.sisu.inject.DefaultBeanLocator.remove(DefaultBeanLocator.java:127)
	at org.eclipse.sisu.launch.SisuTracker.removePublisher(SisuTracker.java:246)
	at org.eclipse.sisu.launch.SisuTracker.purgeBundles(SisuTracker.java:163)
	at org.sonatype.nexus.extender.NexusBundleTracker.close(NexusBundleTracker.java:88)
	at org.eclipse.sisu.launch.SisuExtender.stop(SisuExtender.java:56)
	at org.sonatype.nexus.extender.NexusBundleExtender.doStop(NexusBundleExtender.java:76)
	at org.sonatype.nexus.extender.NexusContextListener.contextDestroyed(NexusContextListener.java:266)
	at org.sonatype.nexus.extender.NexusBundleExtender.stop(NexusBundleExtender.java:56)
	at org.apache.felix.framework.util.SecureAction.stopActivator(SecureAction.java:719)
	at org.apache.felix.framework.Felix.stopBundle(Felix.java:2636)
	at org.apache.felix.framework.Felix.setActiveStartLevel(Felix.java:1391)
	at org.apache.felix.framework.FrameworkStartLevelImpl.run(FrameworkStartLevelImpl.java:308)
	at java.lang.Thread.run(Thread.java:748)
2022-01-06 22:46:51,276+0800 INFO  [FelixStartLevel]  *SYSTEM org.sonatype.nexus.extender.NexusContextListener - Uptime: 7 seconds and 295 milliseconds (nexus-oss-edition/3.20.1.01)
2022-01-06 22:46:51,276+0800 INFO  [FelixStartLevel]  *SYSTEM org.sonatype.nexus.extender.NexusLifecycleManager - Shutting down
2022-01-06 22:46:51,276+0800 INFO  [FelixStartLevel]  *SYSTEM org.sonatype.nexus.extender.NexusLifecycleManager - Stop KERNEL
2022-01-06 22:46:51,282+0800 INFO  [FelixStartLevel]  *SYSTEM org.sonatype.nexus.bootstrap.jetty.JettyServer - Stopping
2022-01-06 22:46:51,282+0800 INFO  [FelixStartLevel]  *SYSTEM org.sonatype.nexus.bootstrap.jetty.JettyServer - Stopping: Server@69dfb304{STARTING}[9.4.18.v20190429]
2022-01-06 22:46:51,282+0800 ERROR [jetty-main-1]  *SYSTEM org.sonatype.nexus.bootstrap.osgi.BootstrapListener - Failed to initialize
java.lang.InterruptedException: null
	at java.lang.Object.wait(Native Method)
	at org.osgi.util.tracker.ServiceTracker.waitForService(ServiceTracker.java:502)
	at org.sonatype.nexus.bootstrap.osgi.BootstrapListener.contextInitialized(BootstrapListener.java:136)
	at org.eclipse.jetty.server.handler.ContextHandler.callContextInitialized(ContextHandler.java:957)
	at org.eclipse.jetty.servlet.ServletContextHandler.callContextInitialized(ServletContextHandler.java:553)
	at org.eclipse.jetty.server.handler.ContextHandler.startContext(ContextHandler.java:922)
	at org.eclipse.jetty.servlet.ServletContextHandler.startContext(ServletContextHandler.java:365)
	at org.eclipse.jetty.webapp.WebAppContext.startWebapp(WebAppContext.java:1497)
	at org.eclipse.jetty.webapp.WebAppContext.startContext(WebAppContext.java:1459)
	at org.eclipse.jetty.server.handler.ContextHandler.doStart(ContextHandler.java:852)
	at org.eclipse.jetty.servlet.ServletContextHandler.doStart(ServletContextHandler.java:278)
	at org.eclipse.jetty.webapp.WebAppContext.doStart(WebAppContext.java:545)
	at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.start(ContainerLifeCycle.java:167)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.doStart(ContainerLifeCycle.java:110)
	at org.eclipse.jetty.server.handler.AbstractHandler.doStart(AbstractHandler.java:113)
	at com.codahale.metrics.jetty9.InstrumentedHandler.doStart(InstrumentedHandler.java:101)
	at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.start(ContainerLifeCycle.java:167)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.doStart(ContainerLifeCycle.java:119)
	at org.eclipse.jetty.server.handler.AbstractHandler.doStart(AbstractHandler.java:113)
	at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.start(ContainerLifeCycle.java:167)
	at org.eclipse.jetty.server.Server.start(Server.java:418)
	at org.eclipse.jetty.util.component.ContainerLifeCycle.doStart(ContainerLifeCycle.java:110)
	at org.eclipse.jetty.server.handler.AbstractHandler.doStart(AbstractHandler.java:113)
	at org.eclipse.jetty.server.Server.doStart(Server.java:382)
	at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:68)
	at org.sonatype.nexus.bootstrap.jetty.JettyServer$JettyMainThread.run(JettyServer.java:274)
```



# 3.解决方法

删除 `sonatype-work/nexus3/db/component` 和 `sonatype-work/nexus3/db/config` 这2个目录下大小为0的以wal结尾的文件重新启动就可以了，具体原因未知

