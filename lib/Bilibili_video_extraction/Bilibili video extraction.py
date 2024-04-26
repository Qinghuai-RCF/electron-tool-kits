# Python 3.11.5

import os
import json
import shutil
import requests
from threading import Thread
import re
import argparse

def sanitize_title(title):
    """
    移除标题中的非法字符。
    """
    if title:
        # 定义非法字符的正则表达式
        illegal_chars = r'[\/:*?"<>|]'

        # 使用正则表达式删除非法字符
        sanitize_title = re.sub(illegal_chars, '', title)

        return sanitize_title

def download(file_path, picture_url):
    """
    异步下载图片。
    """
    print(f'{file_path}开始下载')

    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Edg/120.0.0.0"
    }

    response = requests.get(picture_url, headers=headers)

    if response.status_code == 200:
        with open(file_path, 'wb') as f:
            f.write(response.content)
        print(f"下载成功，保存到: {file_path}")
    else:
        print(f"下载失败，HTTP状态码: {response.status_code}")

def danmaku_files_positoning(dir):
    """
    定位弹幕文件。

    返回值:
    0 弹幕位置为编号
    1 弹幕位置为danmaku.xml
    """
    global dfp
    newDir = dir
    if os.path.isfile(dir):
        if dir.endswith('danmaku.xml'):
            # print('找到了danmaku')
            dfp = dfp + 1
            return
    elif os.path.isdir(dir):
        for s in os.listdir(dir):
            newDir = os.path.join(dir, s)
            danmaku_files_positoning(newDir)
    return

def get_filelist(dir, Filelist):
    """
    获取指定目录下的JSON文件列表。
    """
    newDir = dir
    if os.path.isfile(dir):
        if dir.endswith('entry.json'):
            Filelist.append(dir)
            print(f"{Colors.YELLOW}找到文件{dir}{Colors.END}")
    elif os.path.isdir(dir):
        for s in os.listdir(dir):
            newDir = os.path.join(dir, s)
            get_filelist(newDir, Filelist)
    return Filelist

def get_data(jsonDir, dfp):
    """
    处理JSON文件，提取视频信息。
    """
    f = open(jsonDir, 'r', encoding='utf-8')
    data = json.load(f)
    f.close

    type_tag = data.get('type_tag')
    title = data.get('title')
    owner = data.get('owner_name')
    avid = data.get('avid')
    bvid = data.get('bvid')
    danmaku_count = data.get('danmaku_count')
    cid = data.get('page_data').get('cid')
    page = data.get('page_data').get('page')
    part = data.get('page_data').get('part')
    cover = data.get('cover')

    # 去除非法字符
    title =  sanitize_title(title)
    part =  sanitize_title(part)

    dir = f'{jsonDir[:-10]}{type_tag}\\'
    audioPath = dir + 'audio.m4s'
    videoPath = dir + 'video.m4s'

    # print(f'{dfp = }')

    if dfp == 0:
        xmlPath = f'{dir}{avid}_c_{cid}.xml'
    else:
        xmlPath = f'{jsonDir[:-10]}danmaku.xml'


    if title == part or part == None:
        videoName = f'{owner}_{title}_BV{bvid}'
    else:
        videoName = f'{owner}_{title}_BV{bvid}_{page}_{part}'
    VideoOutPutDir = f'{outPutDir}\\{owner}_{title}_BV{bvid}'

    VideoOutPutPath = f'{VideoOutPutDir}\\{videoName}.mp4'
    assPath = f'{VideoOutPutDir}\\{videoName}.ass'

    print(f"{Colors.YELLOW}尝试合并：{videoName}{Colors.END}")

    return audioPath, videoPath, VideoOutPutDir, VideoOutPutPath, xmlPath, assPath, danmaku_count, cover

def video_audio_merger(data):
    """
    合并视频和音频。
    """
    audioPath = data[0]
    videoPath = data[1]
    VideoOutPutPath = data[3]

    if not os.path.exists(VideoOutPutPath):
      os.system (f'ffmpeg -i \"{videoPath}\" -i \"{audioPath}\" -codec copy \"{VideoOutPutPath}\"')

      print('成功合并视频到：' + VideoOutPutPath + '\n')
    else:
      print('视频已存在，跳过：' + VideoOutPutPath + '\n')

def xml_2_ass(data):
    """
    转换弹幕文件格式。
    xml转ass
    """
    xmlPath = data[4]
    assPath = data[5]
    danmaku_count = data[6]

    if not os.path.exists(assPath):
      if danmaku_count > 0:
          print(xmlPath)
          print(assPath)

          os.system (f'python \"{danmaku2assPath}\" -o \"{assPath}\" -s 1920x1080 -fn "Microsoft Yahei" -fs \"{fs}\" -a \"{alpha}\" -dm 14 -ds 6 \"{xmlPath}\"')

          print(f"{Colors.YELLOW}成功转换弹幕到：{assPath}{Colors.END}")
      else:
          print(f"{Colors.YELLOW}此视频没有弹幕{Colors.END}")
    else:
      print(f"{Colors.YELLOW}弹幕已存在，跳过：{assPath}{Colors.END}")

def normalize_path(path):
    if path is None:
        return None
    if '\\\\' in path:
        return path
    elif '\\' in path:
        return path.replace('\\', '\\\\')
    elif '/' in path:
        return path.replace('/', '\\\\')
    else:
        return None

def quoted_string(input):
    quoted_path = re.search(r'"([^"]*)"', input)
    if quoted_path:
        return normalize_path(quoted_path.group(1))
    else:
        return normalize_path(input)

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    END = '\033[0m'
    YELLOW = '\033[93m'

if __name__ == '__main__':
    # 创建ArgumentParser对象
    parser = argparse.ArgumentParser(description='-i 输入文件夹路径 -o 输出文件夹路径')

    # 添加自定义参数
    parser.add_argument('-i', type=quoted_string, help='输入文件夹路径')
    parser.add_argument('-o', type=quoted_string, help='输出文件夹路径')
    parser.add_argument('-clean', help='清空输出文件夹', action='store_true')

    # 解析命令行参数
    args = parser.parse_args()

    # 访问自定义参数的值
    BDownloadDir = args.i
    outPutDir = args.o
    clean_output = args.clean

    # 运行目录(当前python文件运行目录)
    runDir = os.path.dirname(os.path.abspath(__file__))
    # BDownload目录
    # BDownloadDir = r'E:\User_files_sync\Documents\leidian9\Pictures'
    # 输出目录
    # outPutDir = runDir + r'\output'
    # danmaku2ass文件地址
    danmaku2assPath = runDir + r'\lib\danmaku2ass.py'
    # 弹幕字体大小 默认48 小25
    fs = 25
    # 弹幕透明度
    alpha = 0.6
    # 弹幕位置全局变量
    dfp = 0



    if (BDownloadDir and outPutDir):
        # 清空输出目录
        if os.path.exists(outPutDir):
            if clean_output:
                shutil.rmtree(outPutDir)
        else:
            os.mkdir(outPutDir)

        # 获取json文件地址
        jsonlist = get_filelist(BDownloadDir, [])
        # 获取弹幕位置
        danmaku_files_positoning(BDownloadDir)
        # 遍历json文件
        for jsonDir in jsonlist:
            data = get_data(jsonDir, dfp)
            VideoOutPutDir = data[2]
            if os.path.exists(VideoOutPutDir) != 1:
                os.makedirs(VideoOutPutDir)
                prefix_url = data[7]
                file_path = VideoOutPutDir + r'\cover.jpg'
                picture_url = prefix_url
                if os.path.exists(file_path) != 1:
                    Thread(target=download, args=(file_path, picture_url)).start()
            print('成功创建目录：' + VideoOutPutDir)
            # 合并
            video_audio_merger(data)
            # 转换
            xml_2_ass(data)
    else:
        print(f"{Colors.RED}请输入正确的输入和输出路径{Colors.END}")
