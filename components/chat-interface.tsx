"use client"

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Zap, Database, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  onStartChat: () => void;
  isFullScreen: boolean;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

const quickActions = [
  {
    icon: Cloud,
    label: "AWS Infrastructure",
    description: "Set up AWS resources",
    prompt: "I need to set up a basic AWS infrastructure with VPC, subnets, and an EC2 instance for a web application."
  },
  {
    icon: Zap,
    label: "VM Deployment", 
    description: "Deploy virtual machines",
    prompt: "I want to deploy a virtual machine on Azure with Ubuntu, 4GB RAM, and 2 CPU cores for development."
  },
  {
    icon: Database,
    label: "Database Setup",
    description: "Configure databases",
    prompt: "I need to set up a PostgreSQL database on AWS RDS with backup and monitoring for a production application."
  }
];

const getAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('aws') || lowerMessage.includes('vpc') || lowerMessage.includes('ec2')) {
    return `I'll help you set up AWS infrastructure with Terraform. Here's a configuration for a basic VPC with an EC2 instance:

\`\`\`hcl
# Configure AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# Create VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Create Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet"
  }
}

# Create Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create Security Group
resource "aws_security_group" "web" {
  name_prefix = "web-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web-security-group"
  }
}

# Create EC2 Instance
resource "aws_instance" "web" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id
  
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y httpd
    systemctl start httpd
    systemctl enable httpd
    echo "<h1>Hello from Terraform!</h1>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "web-server"
  }
}

# Output the public IP
output "instance_public_ip" {
  value = aws_instance.web.public_ip
}
\`\`\`

This creates a complete AWS setup with:
- VPC with proper DNS configuration
- Public subnet with internet access
- Security group allowing HTTP and SSH
- EC2 instance with Apache web server
- All necessary networking components

Run \`terraform init\`, \`terraform plan\`, and \`terraform apply\` to deploy!`;
  }

  if (lowerMessage.includes('azure') || lowerMessage.includes('vm') || lowerMessage.includes('virtual machine')) {
    return `I'll help you deploy a virtual machine on Azure. Here's the Terraform configuration:

\`\`\`hcl
# Configure Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Create Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-dev-vm"
  location = "East US"
}

# Create Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-dev"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Create Subnet
resource "azurerm_subnet" "internal" {
  name                 = "subnet-dev"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Create Public IP
resource "azurerm_public_ip" "main" {
  name                = "pip-dev-vm"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  allocation_method   = "Dynamic"
}

# Create Network Security Group
resource "azurerm_network_security_group" "main" {
  name                = "nsg-dev-vm"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Create Network Interface
resource "azurerm_network_interface" "main" {
  name                = "nic-dev-vm"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.internal.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.main.id
  }
}

# Associate Security Group to Network Interface
resource "azurerm_network_interface_security_group_association" "main" {
  network_interface_id      = azurerm_network_interface.main.id
  network_security_group_id = azurerm_network_security_group.main.id
}

# Create Virtual Machine
resource "azurerm_linux_virtual_machine" "main" {
  name                = "vm-dev-ubuntu"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = "Standard_B2s" # 2 vCPUs, 4GB RAM
  admin_username      = "adminuser"

  disable_password_authentication = true

  network_interface_ids = [
    azurerm_network_interface.main.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub") # Update with your SSH key path
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}

# Output the public IP address
output "public_ip_address" {
  value = azurerm_linux_virtual_machine.main.public_ip_address
}
\`\`\`

This configuration creates:
- Resource group to contain all resources
- Virtual network with subnet
- Network security group allowing SSH access
- Public IP for external access
- Ubuntu 22.04 LTS VM with 2 CPUs and 4GB RAM
- Premium SSD storage for better performance

Don't forget to update the SSH key path before applying!`;
  }

  if (lowerMessage.includes('database') || lowerMessage.includes('postgresql') || lowerMessage.includes('rds')) {
    return `I'll help you set up a PostgreSQL database on AWS RDS with backup and monitoring:

\`\`\`hcl
# Configure AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# Create VPC for database
resource "aws_vpc" "db_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "db-vpc"
  }
}

# Create private subnets for RDS
resource "aws_subnet" "db_subnet_1" {
  vpc_id            = aws_vpc.db_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-west-2a"

  tags = {
    Name = "db-subnet-1"
  }
}

resource "aws_subnet" "db_subnet_2" {
  vpc_id            = aws_vpc.db_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-west-2b"

  tags = {
    Name = "db-subnet-2"
  }
}

# Create DB subnet group
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "postgres-subnet-group"
  subnet_ids = [aws_subnet.db_subnet_1.id, aws_subnet.db_subnet_2.id]

  tags = {
    Name = "PostgreSQL DB subnet group"
  }
}

# Create security group for RDS
resource "aws_security_group" "rds_sg" {
  name_prefix = "rds-postgres-sg"
  vpc_id      = aws_vpc.db_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Allow access from VPC
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rds-postgres-security-group"
  }
}

# Create RDS parameter group
resource "aws_db_parameter_group" "postgres_params" {
  family = "postgres15"
  name   = "postgres-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }
}

# Generate random password
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store password in AWS Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "postgres-admin-password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

# Create RDS instance
resource "aws_db_instance" "postgres" {
  identifier     = "postgres-prod"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "appdb"
  username = "postgres"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  parameter_group_name   = aws_db_parameter_group.postgres_params.name

  # Backup configuration
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Monitoring and logging
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql"]

  # Security
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "postgres-prod-final-snapshot"

  tags = {
    Name        = "PostgreSQL Production Database"
    Environment = "production"
  }
}

# IAM role for enhanced monitoring
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "120"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS cpu utilization"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
}

# Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}
\`\`\`

This setup includes:
- PostgreSQL 15.4 on RDS with encryption
- Automated backups (7-day retention)
- Enhanced monitoring and CloudWatch integration
- Security groups restricting access
- Parameter group with performance settings
- Password stored securely in Secrets Manager
- CloudWatch alarms for monitoring
- Auto-scaling storage up to 1TB

Perfect for production workloads with monitoring and backup!`;
  }

  // Default response
  return `I'm here to help you with cloud infrastructure using Terraform! I can assist with:

- **AWS Resources**: EC2, VPC, RDS, S3, Lambda, and more
- **Azure Resources**: Virtual Machines, Storage, Networking, Databases
- **Google Cloud**: Compute Engine, Cloud SQL, VPC, Storage
- **Terraform Best Practices**: Module structure, state management, security

What would you like to build today? You can describe your infrastructure needs in natural language, and I'll generate the Terraform code for you.

Some examples:
- "Create a web server with load balancer on AWS"
- "Set up a Kubernetes cluster on Azure"
- "Deploy a microservices architecture with databases"`;
};

export function ChatInterface({ onStartChat, isFullScreen, messages, setMessages }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      role,
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  };

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;

    // Add user message
    addMessage(content, "user");
    setInput("");
    setIsLoading(true);

    // If this is the first message and we're not in full screen, transition
    if (messages.length === 0 && !isFullScreen) {
      // Small delay to ensure the user message is rendered before transition
      setTimeout(() => {
        onStartChat();
      }, 100);
    }

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = getAIResponse(content);
      addMessage(aiResponse, "assistant");
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string, role: "user" | "assistant" = "assistant") => {
    // First, fix HTML entities
    const decodedContent = content
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    // Split by code blocks first
    const parts = decodedContent.split(/```(\w*)\n([\s\S]*?)```/g);
    
    return parts.map((part, index) => {
      if (index % 3 === 0) {
        // Regular text - process markdown
        return processMarkdown(part, index, role);
      } else if (index % 3 === 1) {
        // Language identifier - skip
        return null;
      } else {
        // Code block
        return (
          <div key={index} className="my-4 rounded-lg bg-muted/50 border">
            <div className="px-4 py-2 border-b bg-muted/30 text-sm font-mono text-muted-foreground">
              {parts[index - 1] || 'code'}
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono">{part}</code>
            </pre>
          </div>
        );
      }
    });
  };

  const processMarkdown = (text: string, key: number, role: "user" | "assistant") => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- ')) {
        // Bullet point
        elements.push(
          <div key={`${key}-${lineIndex}`} className="flex items-center gap-2 my-1">
            <span className="text-primary text-sm leading-none">•</span>
            <span className="flex-1">{formatInlineMarkdown(trimmedLine.substring(2), role)}</span>
          </div>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        // Bold heading
        elements.push(
          <div key={`${key}-${lineIndex}`} className="font-semibold text-foreground my-2">
            {trimmedLine.slice(2, -2)}
          </div>
        );
      } else if (trimmedLine) {
        // Regular text with inline formatting
        elements.push(
          <div key={`${key}-${lineIndex}`} className="my-1">
            {formatInlineMarkdown(trimmedLine, role)}
          </div>
        );
      } else {
        // Empty line - add spacing
        elements.push(<div key={`${key}-${lineIndex}`} className="h-2" />);
      }
    });
    
    return elements;
  };

  const formatInlineMarkdown = (text: string, role: "user" | "assistant" = "assistant") => {
    let processedText = text;
    const elements: React.ReactNode[] = [];
    
    // Split by inline code first `code`
    const codeRegex = /`([^`]+)`/g;
    const codeParts = processedText.split(codeRegex);
    
    codeParts.forEach((part, index) => {
      if (index % 2 === 1) {
        // This is inline code - style based on message role
        const codeClassName = role === "user" 
          ? "bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded text-sm font-mono"
          : "bg-muted px-1.5 py-0.5 rounded text-sm font-mono";
        
        elements.push(
          <code key={index} className={codeClassName}>
            {part}
          </code>
        );
      } else {
        // Process bold text in regular text
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = part.split(boldRegex);
        
        boldParts.forEach((boldPart, boldIndex) => {
          if (boldIndex % 2 === 1) {
            // This is bold text
            elements.push(
              <strong key={`${index}-${boldIndex}`} className="font-semibold">
                {boldPart}
              </strong>
            );
          } else if (boldPart) {
            // Regular text
            elements.push(boldPart);
          }
        });
      }
    });
    
    return elements;
  };

  if (!isFullScreen) {
    // Compact mode for welcome screen
    return (
      <div className="w-full space-y-6 animate-fade-in-up">
        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-105 border-dashed hover:border-solid" onClick={() => handleQuickAction(action.prompt)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{action.label}</h4>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe your infrastructure needs... (e.g., 'Set up a web server on AWS')"
            className="min-h-[80px] pr-12 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Bot className="h-4 w-4" />
            Generating infrastructure code...
          </div>
        )}
      </div>
    );
  }

  // Full screen mode
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">Ask me about cloud infrastructure, and I'll help you build it with Terraform.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={message.id} className={`flex gap-4 animate-fade-in-up ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2">
                  <Badge variant={message.role === "user" ? "default" : "secondary"}>
                    {message.role === "user" ? "You" : "Assistant"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className={`inline-block rounded-lg p-4 ${message.role === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/50 border"}`}>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formatMessage(message.content, message.role)}
                  </div>
                </div>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 animate-bounce">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Badge variant="secondary">Assistant</Badge>
                <div className="rounded-lg p-4 bg-muted/50 border mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about cloud infrastructure..."
              className="min-h-[60px] pr-12 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="absolute bottom-3 right-3 h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
