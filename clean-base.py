#!/usr/bin/env python
import sys, os, subprocess, time, datetime, getpass, argparse
from sys import argv

try:
	whoami = getpass.getuser()
except:
	whoami = "Bernd"

ap = argparse.ArgumentParser(
		description="Setting up a clean ViUR project base.",
		epilog="The script runs interactively if not command-line arguments are passed.")

ap.add_argument("-A", "--app_id", type=str, help="The application-id that should be replaced in the arbitrary places.")
ap.add_argument("-a", "--author", type=str, default=whoami, help="The author's name that is placed in arbitrary places.")

args = ap.parse_args()

app_id = args.app_id
whoami = args.author

if args.app_id is None:
	try:
		prompt = "Enter Author Name (leave empty to default to %s): " % getpass.getuser()
		whoami = raw_input(prompt)
		if whoami == "":
			whoami = getpass.getuser()
	except:
		whoami = raw_input("Enter Author Name: ")
	try:
		def_appid = os.path.split(os.getcwd())[-1]+"-viur"
		prompt = "Enter application-id (leave empty to default to %s): " % def_appid
		app_id = raw_input(prompt)
		if app_id == "":
			app_id = def_appid
	except:
		app_id = raw_input("Enter application-id: ")

time = time.time()
timestamp = datetime.datetime.fromtimestamp(time).strftime('%Y-%m-%d %H:%M:%S')

workdir = os.getcwd()+"/deploy"
file_list = ["viur-project.md", "local_run.sh"]
replacements = {"{{app_id}}":app_id, "{{whoami}}":whoami, "{{timestamp}}":timestamp}
if os.path.exists(".git"):
	print("Downloading submodules")
	subprocess.check_output('git submodule init', shell=True)
	subprocess.check_output('git submodule update', shell=True)
	subprocess.check_output('cd vi && git submodule init && git submodule update', shell=True)
	print("Removing .git tether")
	try:
		subprocess.check_output('git remote rm origin', shell=True)
	except:
		pass
else:
	print(".git tether already removed")

for subdir, dirs, files in os.walk("."):
	for file in files:
		filepath = subdir + os.sep + file

		if any([filepath.endswith(ext) for ext in [".py", ".yaml", ".html", ".md", ".sh"]]):
			file_list.append(filepath)
#print (file_list)

for file_obj in file_list:
	lines = []
	with open(file_obj) as infile:
		for line in infile:
			for src, target in replacements.iteritems():
				line = line.replace(src, target)
			lines.append(line)
	with open(file_obj, 'w') as outfile:
		for line in lines:
			outfile.write(line)

# Rename viur project
orig = os.path.join(workdir, "viur-project.py")
newname = os.path.join(workdir, app_id+".py")
os.rename(orig, newname)

# Create a README.md
os.rename("viur-project.md", "README.md")

# Remove yourself!
os.remove(argv[0])
