---
title: 新装 GPU 服务器的容器化配置笔记
subtitle: 在 JupyterHub 环境下
author: Zhenghao Wu
description: 
featureimage: https://unsplash.com/photos/G7PV6gd-w4g/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mjh8fGNvbnRhaW5lcnxlbnwwfHx8fDE3MzI0NTk5OTd8MA&force=true&w=2400
unsplashfeatureimage: CHUTTERSNAP

publishDate: "2024-11-24T14:54:00+00:00"
lastmod: 
draft: false
status: Finished
# In Progress, Staging, Finished, Lagacy

showmeta: true
hidereadtime: false
toc: false
math: false
gallery: false
showinfocard: true
enablecomment: true

series: 
previous:
next:

confidence: Verified in practice
importance: 8

tags:
- Docker
- Container
- Docker Images
- Self-host
- GPU
- JupyterHub
- NVIDIA GPU
- CUDA
- PyTorch
- RTX 4090D
- NVIDIA A100

categories:
- Tech
- Cloud
- Server

# type: file, link, image, and others
extramaterials:
- type: link
  name: 【2022新教程】Ubuntu server 20.04如何安装nvidia驱动和cuda-解决服务器ssh一段时间后连不上的问题
  url: https://www.cnblogs.com/luk/p/15532628.html
- type: link
  name: CUDA Tookit Documentation
  url: https://developer.nvidia.com/cuda-toolkit-archive
- type: link
  name: Installing the NVIDIA Container Toolkit
  url: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
- type: link
  name: How to prevent NVIDIA drivers from automatically upgrading on Ubuntu?
  url: https://stackoverflow.com/a/76065388


copyright: 
# inherit cc0 by bysa bync byncsa bynd byncnd unsplash
---

## 前言

最近需要给一台以前配置的 CPU 服务器装上 GPU，这台机器之前已经配置好了存储和基于 Docker 和 JupyterHub 的计算环境。这里就记录一下装上 GPU 后的配置过程。本文只涉及系统和软件层面的调整。也就是新增的显卡已经安装到设备内，且设备已经能够被系统识别。可以通过 `lspci | grep "NVIDIA"` 命令查看设备是否被识别。

下面为两个成功识别显卡设备的例子：

```bash
$ lspci | grep "NVIDIA"
af:00.0 3D controller: NVIDIA Corporation GA100 [A100 PCIe 80GB] (rev a1)
d8:00.0 3D controller: NVIDIA Corporation GA100 [A100 PCIe 80GB] (rev a1)
# 专业卡会显示为 3D controller
```

```bash
$ lspci | grep "NVIDIA"
31:00.0 VGA compatible controller: NVIDIA Corporation Device 2685 (rev a1)
31:00.1 Audio device: NVIDIA Corporation Device 22ba (rev a1)
b1:00.0 VGA compatible controller: NVIDIA Corporation Device 2685 (rev a1)
b1:00.1 Audio device: NVIDIA Corporation Device 22ba (rev a1)
# 游戏卡会显示为 VGA compatible controller
```

另外系统版本为 Ubuntu 22.04。系统已经安装 Docker，且 Docker 版本大于 19.03。

## 1. 禁用 Nouveau 驱动

Nouveau 驱动是一个开源的 NVIDIA 显卡驱动，但是在使用 NVIDIA 官方驱动时，需要禁用 Nouveau 驱动。否则会导致显卡驱动无法正常加载。

- 1 编辑 `/etc/modprobe.d/blacklist-nouveau.conf` 文件，添加以下内容：

    ```txt
    blacklist nouveau
    blacklist lbm-nouveau
    options nouveau modeset=0
    alias nouveau off
    alias lbm-nouveau off
    ```

    `/etc/modprobe.d` 目录里面存放了内核模块的配置文件。这里我们创建了一个名为 `blacklist-nouveau.conf` 的文件，里面存放了禁用 Nouveau 驱动的配置。

- 2 关闭 nouveau

    ```bash
    echo options nouveau modeset=0 | sudo tee -a /etc/modprobe.d/nouveau-kms.conf
    ```

    我们通过 `tee` 命令将 `options nouveau modeset=0` 写入到 `/etc/modprobe.d/nouveau-kms.conf` 文件中。这样就关闭了 nouveau 驱动。

- 3 更新 initramfs

    ```bash
    sudo update-initramfs -u
    sudo reboot
    ```

    `update-initramfs` 命令用于更新 initramfs (initial RAM file system)。initramfs 是一个临时的根文件系统，用于在 Linux 内核引导时加载必要的驱动程序。我们需要更新 initramfs 以使新的内核模块配置生效。`-u` 参数表示更新。更新完成后，重启系统。

- 4 验证

    重启后执行以下命令。如果没有输出，说明 Nouveau 驱动已经被禁用。

    ```bash
    lsmod | grep nouveau
    ```

## 2. 安装 NVIDIA 驱动

- 1 安装依赖

    NVIDIA 驱动需要一些依赖，我们需要先安装这些依赖。

    ```bash
    sudo apt-get install build-essential dkms
    ```

    `build-essential` 包含了编译 C/C++ 程序所需要的工具，`dkms` 是一个动态内核模块框架。

- 2 确认 NVIDIA 驱动版本

    首先我们需要确认显卡所需的驱动版本。可以在 NVIDIA 官网（https://www.nvidia.com/en-us/drivers/）上查看。
    这边可以看到 4090D 的推荐驱动为 550.135 版本。

    这里你可以直接在官网上下载驱动，然后通过 `sh NVIDIA-Linux-x86_64-550.135.run` 来安装。但我们这里使用 `apt` 来安装。

    首先通过 ubuntu-drivers 工具来查看推荐的驱动版本：

    ```bash
    ubuntu-drivers devices
    ```

    通过上面的命令，我们可以看到推荐的驱动版本。

    ```bash
    $ ubuntu-drivers devices
    == /sys/devices/pci0000:b0/0000:b0:02.0/0000:b1:00.0 ==
    modalias : pci:v000010DEd00002685sv000010DEsd00001697bc03sc00i00
    vendor   : NVIDIA Corporation
    driver   : nvidia-driver-550-open - distro non-free
    driver   : nvidia-driver-550-server-open - distro non-free
    driver   : nvidia-driver-550 - distro non-free recommended
    driver   : nvidia-driver-550-server - distro non-free
    driver   : xserver-xorg-video-nouveau - distro free builtin
    ```

    我们可以看到推荐的驱动版本为 `nvidia-driver-550`，这与官网上的推荐驱动版本一致。这些驱动中我们要选择的是 **nvidia-driver-550-server**。

- 3 安装驱动

    安装的操作比较简单，只需要执行以下命令即可：

    ```bash
    sudo apt-get install -y nvidia-driver-550-server
    ```

    安装完成后，重启系统。

- 4 验证

    重启后执行以下命令，如果有输出，说明驱动安装成功。

    ```bash
    nvidia-smi
    ```

    `nvidia-smi` 是 NVIDIA 提供的一个命令行工具，用于查看显卡信息。

    ```bash
    $ nvidia-smi
    Fri Nov 22 15:12:11 2024       
    +-----------------------------------------------------------------------------------------+
    | NVIDIA-SMI 550.127.05             Driver Version: 550.127.05     CUDA Version: 12.4     |
    |-----------------------------------------+------------------------+----------------------+
    | GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
    | Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
    |                                         |                        |               MIG M. |
    |=========================================+========================+======================|
    |   0  NVIDIA GeForce RTX 4090 D      Off |   00000000:31:00.0 Off |                  Off |
    | 60%   37C    P0             59W /  425W |       1MiB /  24564MiB |      0%      Default |
    |                                         |                        |                  N/A |
    +-----------------------------------------+------------------------+----------------------+
    |   1  NVIDIA GeForce RTX 4090 D      Off |   00000000:B1:00.0 Off |                  Off |
    |100%   35C    P0             76W /  425W |       1MiB /  24564MiB |      1%      Default |
    |                                         |                        |                  N/A |
    +-----------------------------------------+------------------------+----------------------+
                                                                                            
    +-----------------------------------------------------------------------------------------+
    | Processes:                                                                              |
    |  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
    |        ID   ID                                                               Usage      |
    |=========================================================================================|
    |  No running processes found                                                             |
    +-----------------------------------------------------------------------------------------+

    ```

- 5 禁用 NVIDIA 自动更新

    Ubuntu 下，NVIDIA 驱动会自动更新，如果自动更新后，则需要系统重启才能生效。这样会导致一些服务的中断。我们可以通过以下操作来禁用自动更新：

    在 `/etc/apt/apt.conf.d/50unattended-upgrades` 文件中，将 `Unattended-Upgrade::Package-Blacklist` 选项中添加 `nvidia-*` 和 `libnvidia-`。

    ```bash
    Unattended-Upgrade::Package-Blacklist {
        "nvidia-";
        "libnvidia-";
        ...
    }
    ```

## 3. 安装 CUDA

### 3.1 下载 CUDA 安装包

CUDA 是 NVIDIA 提供的一个并行计算平台和编程模型。我们可以通过 CUDA 来加速计算。但是在安装 CUDA 之前，我们需要确认安装的版本，新的驱动版本可能不支持旧的 CUDA 版本。

在刚刚步骤中，我们可以看到 `nvidia-smi` 的输出中有 CUDA 的版本（右上角）。这里我们可以看到 CUDA 的版本为 12.4。

我们可以在 NVIDIA 官网（https://developer.nvidia.com/cuda-toolkit-archive）上查看 CUDA 的版本。这里我们可以看到 12.4 的 CUDA 版本为 12.4.0 和 12.4.1。这里我们选择安装 12.4.1 版本。

在页面中，会要求你选择系统的情况，这里我们选择 Linux -> x86_64 -> Ubuntu -> 22.04 -> runfile (local)。

页面中会展示下载链接和安装的指令。

```bash
wget https://developer.download.nvidia.com/compute/cuda/12.4.1/local_installers/cuda_12.4.1_550.54.15_linux.run
sudo sh cuda_12.4.1_550.54.15_linux.run
```

### 3.2 安装 CUDA

使用 `wget` 下载 CUDA 安装包，然后使用 `sh` 执行安装。

安装过程中会有一些提示，其中包括是否安装驱动，因为我们先前已经安装了驱动，所以我们要取消驱动安装的勾选（因为内带的驱动版本可能不是最新的）。

### 3.3 配置环境变量

安装完成后，我们需要配置环境变量。主要是将 CUDA bin 的路径添加到环境变量中。

- 1 首先创建 `/etc/profile.d/cuda.sh` 文件

    并在里面填入内容：
    ```bash
    export PATH=/usr/local/cuda-12.4/bin:$PATH
    export LD_LIBRARY_PATH=/usr/local/cuda-12.4/lib64:$LD_LIBRARY_PATH
    ```
    这里我们将 CUDA 12.4 的 bin 目录添加到 PATH 中，将 CUDA 12.4 的 lib64 目录添加到 LD_LIBRARY_PATH 中。保存文件。

- 2 修改文件权限

    ```bash
    sudo chmod +x /etc/profile.d/cuda.sh
    ```

    修改文件权限，使其可以被执行。

- 3 使环境变量生效

    这里可以选择重启系统，或者执行以下命令使环境变量生效：

    ```bash
    source /etc/profile
    ```
    
- 4 验证

    验证 CUDA 是否安装成功，可以执行以下命令：

    ```bash
    nvcc --version
    ```

    如果有输出，说明 CUDA 安装成功。

    ```bash
    $ nvcc --version
    nvcc: NVIDIA (R) Cuda compiler driver
    Copyright (c) 2005-2024 NVIDIA Corporation
    Built on Thu_Mar_28_02:18:24_PDT_2024
    Cuda compilation tools, release 12.4, V12.4.131
    Build cuda_12.4.r12.4/compiler.34097967_0
    ```

## 4. 安装 nvidia-container-toolkit

nvidia-container-toolkit 是一个用于 Docker 的工具，用于支持 NVIDIA GPU 的 Docker 容器。

- 1 添加 APT 的密钥和镜像

    直接执行以下命令来添加 APT 的密钥和镜像：

    ```bash
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
    && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
    ```

- 2 更新 APT，使新的源生效。

    ```bash
    sudo apt-get update
    ```

- 3 安装 nvidia-container-toolkit

    ```bash
    sudo apt-get install -y nvidia-container-toolkit
    ```

    因为文件需要从 GitHub 下载，所以可能会比较慢，请耐心等待。

- 4 修改 Docker 配置

    ```bash
    sudo nvidia-ctk runtime configure --runtime=docker
    ```

    这个命令会修改 Docker 的配置文件，使其支持 NVIDIA GPU。具体的，它会在 `/etc/docker/daemon.json` 文件中添加一个叫 `nvidia` `runtimes` 的配置项。

    ```json
    {
        "runtimes": {
            "nvidia": {
                "path": "/usr/bin/nvidia-container-runtime",
                "runtimeArgs": []
            }
        }
    }
    ```

    配置好后，你未来启动 Docker 时，可以使用 `--runtime=nvidia` 来指定使用 NVIDIA GPU。目前这个设置还不是默认的，所以需要手动指定。我们还需要额外增加一行 `"default-runtime": "nvidia",` 来指定默认的运行时。

    ```json
    {
        "default-runtime": "nvidia",
        "runtimes": {
            "nvidia": {
                "path": "/usr/bin/nvidia-container-runtime",
                "runtimeArgs": []
            }
        }
    }
    ```

    这个配置下，Docker 将默认使用 NVIDIA GPU 运行容器。

- 5 重启 Docker

    ```bash
    sudo systemctl restart docker
    ```

    重启 Docker 使配置生效。

- 6 验证

    执行以下命令，如果有输出 nvidia-smi 的信息，说明配置成功。（需要确保本地有 ubuntu 镜像）

    ```bash
    sudo docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi
    ```

## 6. 构建 Docker 镜像

我们将采用 EPTI 基础 Dockerfile 集（基于 [docker-stacks](https://github.com/jupyter/docker-stacks) 和 nvidia/cuda 镜像构建）。包含了 miniconda，jupyterlab，pytorch 等常用的库。当你在执行构建时，需要修改 Dockerfile 中的 `FORM` 字段。

这个集含多个 Dockerfile，他们的依赖关系为：
```
nvidia/cuda:12.4.1-cudnn-devel-ubuntu22.04
└── @/docker-stacks-foundation-gpu-cuda<CUDA VERSION>:latest
    └── @/base-gpu-notebook-cuda<CUDA VERSION>:latest
        └── @/pytorch-gpu-notebook-cuda<CUDA VERSION>:latest

@ = reg.epti.moe/epti-jupyter （这个是生产环境内使用的内部镜像，你可以改成自己的名字）
```

其中：

1. `reg.epti.moe/epti-jupyter/docker-stacks-foundation-gpu-cuda12.4` 相关文件存储在 foundation 文件夹啊中，进入后使用 `docker build . -t reg.epti.moe/epti-jupyter/docker-stacks-foundation-gpu-cuda12.4:latest` 指令来构建。
    - 基于 NVIDIA CUDA 12.4.1 的基础镜像（cudnn devel 版本）
    - 配置了基础操作系统环境，安装必要的系统包
    - 创建了名为 jovyan 的非 root 用户
    - 使用 Micromamba 安装和管理 Python（默认 3.11）及相关包
    - 配置了 Jupyter 运行所需的各种环境变量和目录权限
    - 设置了容器启动相关的配置，包括入口点和启动钩子
2. `reg.epti.moe/epti-jupyter/base-gpu-notebook-cuda12.4` 相关文件存储在 base 文件夹中，进入后使用 `docker build . -t reg.epti.moe/epti-jupyter/base-gpu-notebook-cuda12.4:latest` 指令来构建。
    - 基于 foundation 构建，安装系统包：fonts-liberation（字体），pandoc（文档转换），run-one（命令运行管理）
    - Jupyter 组件安装：JupyterLab/Jupyter Notebook/JupyterHub/NBClassic
    - 配置设置：端口 8888/健康检查/启动脚本和配置文件

3. `reg.epti.moe/epti-jupyter/pytorch-gpu-notebook-cuda12.4` 相关文件存储在 pytorch 文件夹中，进入后使用 `docker build . -t reg.epti.moe/epti-jupyter/pytorch-gpu-notebook-cuda12.4:latest` 指令来构建。
    - 基于 base 构建，安装 PyTorch 和相关库
    - 安装了 torch、torchvision、torchaudio
    - 安装了 tensorboard、visual studio code 支持

## 7. 添加 Docker 镜像到 JupyterHub 配置中

在 JupyterHub 的配置文件中，我们需要添加 Docker 镜像的配置。请使用 root 权限修改 `jupyterhub_config.py` 配置文件。找到 `c.DockerSpawner.allowed_images` 配置项，添加新的镜像。这里的格式是字典，键为镜像名称，值为镜像地址。以下是配置的一个例子。

```python
c.DockerSpawner.allowed_images = {
    '[GPU] Pytorch 2.4.1 (Python 3.11, CUDA12.4)': 'reg.epti.moe/epti-jupyter/pytorch-gpu-notebook-cuda12.4:latest',
    '[ R ] 基础环境': 'reg.epti.moe/epti-jupyter/r-notebook:latest',
    '[PYTHON] 基础环境': 'reg.epti.moe/epti-jupyter/minimal-notebook:latest',
}
```

## 小结

这里我们记录了在 Ubuntu 22.04 系统上配置新添加 NVIDIA GPU 的过程。主要包括了禁用 Nouveau 驱动、安装 NVIDIA 驱动、安装 CUDA、安装 nvidia-container-toolkit、构建 Docker 镜像、添加 Docker 镜像到 JupyterHub 配置中。这里我们使用了 EPTI 的基础镜像集，构建了一个 PyTorch 的 GPU 镜像。这个镜像可以用于 JupyterHub 的 GPU 计算环墋中。
