import { Test, TestingModule } from '@nestjs/testing'
import { EncryptionService } from './encryption.service'
import { ConfigService } from '@nestjs/config'

describe('EncryptionService', () => {
  let service: EncryptionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ENCRYPTION_SECRET') {
                return '38a17bc88d79a5f56fa230e2b909d7881ef5e38b0ea1a30ae768b7ec9880df14'
              }
              return null
            }),
          },
        },
      ],
    }).compile()

    service = module.get<EncryptionService>(EncryptionService)
  })

  it('should Hello Nigeria', () => {
    const encrypt = service.encrypt('Hello Nigeria')
    const decrypt = service.decrypt(encrypt)
    expect(decrypt).toBe('Hello Nigeria')
  })
})
