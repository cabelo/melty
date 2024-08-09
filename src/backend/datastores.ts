import { Task } from "./tasks";
import * as fs from "fs";
import * as path from "path";

export function loadTasksFromDisk(gitRepoRoot: string): Map<string, Task> {
    const meltyDir = path.join(gitRepoRoot, ".melty");
    if (!fs.existsSync(meltyDir)) {
        return new Map();
    }

    const taskFiles = fs.readdirSync(meltyDir);
    const taskMap = new Map<string, Task>();
    for (const file of taskFiles) {
        // strip extension from file
        const taskId = path.parse(file).name;
        const taskData = JSON.parse(fs.readFileSync(path.join(meltyDir, file), "utf8"));
        const task = Object.assign(new Task(taskId, taskId), taskData);

        taskMap.set(task.id, task);
    }
    return taskMap;
}

export async function writeTaskToDisk(task: Task): Promise<void> {
    if (!task.gitRepo) {
        console.log(`Not saving task ${task.id} to disk, no git repo found`);
        return;
    }

    const meltyDir = path.join(task.gitRepo.rootPath, ".melty");
    if (!fs.existsSync(meltyDir)) {
        fs.mkdirSync(meltyDir);
    }

    // Create a copy of the task to modify for serialization
    const serializableTask = { ...task };
    if (serializableTask.gitRepo) {
        // get rid of gitRepo.repository field
        serializableTask.gitRepo = { ...serializableTask.gitRepo, repository: null };
    }

    const taskPath = path.join(meltyDir, `${task.id}.json`);
    fs.writeFileSync(taskPath, JSON.stringify(serializableTask, null, 2));
}