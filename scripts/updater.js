importPackage(org.apache.commons.cli);
importPackage(java.io);
importPackage(org.itxtech.mcl);
importPackage(java.lang);

phase.cli = () => {
    let update = Option.builder("u").desc("�����Զ�����").longOpt("disable-update").build();
    loader.options.addOption(update);
};

phase.load = () => {
    let packages = loader.config.packages;
    for (let i in packages) {
        check(packages[i]);
    }
};

function checkLocalFile(pack) {
    let baseName = pack.name + "-" + pack.localVersion;
    return FileUtil.check(new File(loader.libDir, baseName + ".jar"), new File(loader.libDir, baseName + ".md5"));
}

function check(pack) {
    logger.info("������֤ " + pack.name + " �汾��" + pack.localVersion);
    let download = false;
    let force = false;
    if (!checkLocalFile(pack)) {
        logger.info(pack.name + " �ļ�У��ʧ�ܣ���ʼ���ء�");
        download = true;
        force = true;
    }
    if (!loader.cli.hasOption("u")) {
        download = true;
    }
    if (download) {
        let info = loader.repo.fetchPackage(pack.name);
        if (!info.channels.containsKey(pack.channel)) {
            logger.error("�Ƿ��ĸ���Ƶ����" + pack.channel + " ����" + pack.name);
        } else {
            let target = info.channels[pack.channel];
            let ver = target[target.size() - 1];
            if (force || !pack.localVersion.equals(ver)) {
                downloadFile(pack.name, ver);
                pack.localVersion = ver;
                if (!checkLocalFile(pack)) {
                    logger.warning(pack.name + " �����ļ���ȻУ��ʧ�ܣ��������硣");
                }
            }
        }
    }
}

function downloadFile(name, ver) {
    down(loader.repo.getDownloadUrl(name, ver, "jar"), new File(loader.libDir, name + "-" + ver + ".jar"));
    down(loader.repo.getDownloadUrl(name, ver, "md5"), new File(loader.libDir, name + "-" + ver + ".md5"));
}

function down(url, file) {
    loader.downloader.download(url, file, (total, current) => {
        System.out.print("total: " + total + " cur: " + current + "\r");
    });
    System.out.println();
}
