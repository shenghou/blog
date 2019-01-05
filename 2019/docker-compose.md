### 一个典型的docker-compose.yml文件如下

```yml
  
version: "3"
services:
    app:
    build: 
      context: .        //用于指定提供的值的相对
      dockerfile: Dockerfile-app
    command: npm --prefix packages/warrior-app run debug
    ports:
      - 7001:7001
      - 9999:9999
    volumes:
      - ./packages/warrior-app:/code/packages/warrior-app
      - node_modules_app:/code/packages/warrior-app/node_modules
      - prometheus_conf:/code/packages/warrior-app/prometheus
    depends_on:
      - db
    deploy:
      resources:
        reservations:
          cpus: '0.40'
  redis:
    image: redis:alpine
    ports:
      - "6379"
    networks:
      - frontend
    deploy:
      replicas: 2
      update_config:
        parallelism: 2
        delay: 10s
      restart_policy:
        condition: on-failure
  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8080:8080"
    stop_grace_period: 1m30s
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    deploy:
      placement:
        constraints: [node.role == manager]
networks:
  frontend:
  backend:
 
volumes:

```

### 相关文档
 * [基本入门类](https://www.cnblogs.com/senlinyang/p/8856975.html)
 * [基本命令](https://blog.csdn.net/u011781521/article/details/80464826)
 * [dockerfile](https://blog.csdn.net/wo18237095579/article/details/80540571)
 * [dockerfile 命令](https://www.cnblogs.com/lighten/p/6900556.html)
