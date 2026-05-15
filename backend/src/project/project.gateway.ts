import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets'
import { DeploymentStatus } from 'generated/prisma/enums'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/deployments' })
export class ProjectGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected for build tracking: ${client.id}`)
  }

  @SubscribeMessage('join-project-room')
  handleJoinRoom(client: Socket, projectId: string) {
    client.join(projectId)
    console.log(`Client ${client.id} joined room: ${projectId}`)
    return { event: 'joined', data: projectId }
  }

  // An helper method a Service calls to broadcast updates
  broadcastStatus(projectId: string, status: DeploymentStatus, startTime?: number) {
    this.server.to(projectId).emit('status-update', {
      projectId,
      status,
      startTime: startTime || null,
    })
  }
}