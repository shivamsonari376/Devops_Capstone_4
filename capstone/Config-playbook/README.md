## 📁 File: `ansible-instance-config-playbook.yaml`

### 🔧 What It Does

1. Updates all system packages.
2. Installs essential dependencies (curl, unzip, wget, tar).
3. Installs and enables Docker.
4. Adds the current user to the `docker` group.
5. Installs AWS CLI v2.
6. Installs `kubectl` CLI.
7. Verifies `kubectl` installation.

---

## 🖋️ How to Use

### 1. Update Your Inventory File

Add your EC2 instance(s) under the `ec2_instances` group in your Ansible inventory file.

Example (`inventory/hosts`):

```ini
[ec2_instances]
private.dns.your.eks.workernode ansible_user=ec2-user ansible_ssh_private_key_file=~/.ssh/your-key.pem
private.dns.your.eks.workernode ansible_user=ec2-user ansible_ssh_private_key_file=~/.ssh/your-key.pem
```

- `ansible_user` is typically `ec2-user` for Amazon Linux 2.
- Make sure your SSH key path is correct.

### 2. Run the Playbook

```bash
ansible-playbook -i inventory/hosts ansible-instance-config-playbook.yaml
```

---
