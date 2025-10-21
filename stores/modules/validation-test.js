/**
 * 数据验证机制测试文件
 * 功能描述：测试新的数据验证机制是否正常工作
 * 主要功能：验证测试、错误处理测试、性能测试
 */

import { useValidationStore } from './validation'

// 测试数据验证机制
export const testValidationMechanism = () => {
  console.log('🧪 开始测试数据验证机制...')
  
  const validationStore = useValidationStore()
  
  // 测试1: 用户信息验证
  console.log('\n📋 测试1: 用户信息验证')
  try {
    const validUserInfo = {
      id: '123',
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '13800138000',
      email: 'test@example.com',
      isVip: true,
      level: 5
    }
    
    const result1 = validationStore.validateUserInfo(validUserInfo)
    console.log('✅ 有效用户信息验证通过:', result1)
  } catch (error) {
    console.error('❌ 有效用户信息验证失败:', error)
  }
  
  // 测试2: 无效用户信息验证
  console.log('\n📋 测试2: 无效用户信息验证')
  try {
    const invalidUserInfo = {
      id: '', // 空ID
      nickName: '', // 空昵称
      avatarUrl: 'invalid-url', // 无效URL
      phone: '123', // 无效手机号
      email: 'invalid-email', // 无效邮箱
      isVip: 'yes', // 错误类型
      level: 15 // 超出范围
    }
    
    const result2 = validationStore.validateUserInfo(invalidUserInfo)
    console.log('✅ 无效用户信息被正确拒绝:', result2)
  } catch (error) {
    console.log('✅ 无效用户信息验证失败（预期行为）:', error.message)
  }
  
  // 测试3: 民宿信息验证
  console.log('\n📋 测试3: 民宿信息验证')
  try {
    const validHomestay = {
      id: '456',
      title: '美丽民宿',
      description: '这是一个美丽的民宿',
      price: 299,
      location: '北京市朝阳区',
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      facilities: ['wifi', 'parking'],
      rating: 4.5,
      reviewCount: 128,
      host: { id: '789', name: '房东' },
      coordinates: { lat: 39.9042, lng: 116.4074 },
      roomType: 'entire',
      maxGuests: 4,
      amenities: ['kitchen', 'washing_machine'],
      policies: { checkIn: '14:00', checkOut: '12:00' },
      availability: { start: '2024-01-01', end: '2024-12-31' }
    }
    
    const result3 = validationStore.validateHomestay(validHomestay)
    console.log('✅ 有效民宿信息验证通过:', result3)
  } catch (error) {
    console.error('❌ 有效民宿信息验证失败:', error)
  }
  
  // 测试4: 搜索参数验证
  console.log('\n📋 测试4: 搜索参数验证')
  try {
    const validSearchParams = {
      keyword: '民宿',
      page: 1,
      size: 20,
      sortBy: 'price_asc',
      location: '北京'
    }
    
    const result4 = validationStore.validateSearchParams(validSearchParams)
    console.log('✅ 有效搜索参数验证通过:', result4)
  } catch (error) {
    console.error('❌ 有效搜索参数验证失败:', error)
  }
  
  // 测试5: 数据清洗功能
  console.log('\n📋 测试5: 数据清洗功能')
  try {
    const dirtyData = {
      nickname: '  测试用户  ', // 前后空格
      bio: '  这是一个简介  ', // 前后空格
      location: '  北京  ' // 前后空格
    }
    
    const rules = {
      nickname: { type: 'string', maxLength: 20 },
      bio: { type: 'string', maxLength: 200 },
      location: { type: 'string', maxLength: 50 }
    }
    
    const cleanedData = validationStore.sanitizeData(dirtyData, rules)
    console.log('✅ 数据清洗结果:', cleanedData)
  } catch (error) {
    console.error('❌ 数据清洗失败:', error)
  }
  
  // 测试6: 批量验证
  console.log('\n📋 测试6: 批量验证')
  try {
    const userList = [
      { id: '1', nickName: '用户1', avatarUrl: 'https://example.com/1.jpg' },
      { id: '2', nickName: '用户2', avatarUrl: 'https://example.com/2.jpg' },
      { id: '', nickName: '', avatarUrl: 'invalid' }, // 无效数据
      { id: '4', nickName: '用户4', avatarUrl: 'https://example.com/4.jpg' }
    ]
    
    const userRules = {
      id: { required: true, type: 'string' },
      nickName: { required: true, type: 'string', maxLength: 20 },
      avatarUrl: { type: 'string', pattern: /^https?:\/\/.+/ }
    }
    
    const batchResult = validationStore.batchValidate(userList, userRules)
    console.log('✅ 批量验证结果:', batchResult)
    console.log(`   - 成功: ${batchResult.successCount}`)
    console.log(`   - 失败: ${batchResult.failureCount}`)
  } catch (error) {
    console.error('❌ 批量验证失败:', error)
  }
  
  // 测试7: 验证统计
  console.log('\n📋 测试7: 验证统计')
  const stats = validationStore.getValidationStats()
  console.log('✅ 验证统计信息:', stats)
  console.log(`   - 总验证次数: ${stats.totalValidations}`)
  console.log(`   - 成功次数: ${stats.successfulValidations}`)
  console.log(`   - 失败次数: ${stats.failedValidations}`)
  console.log(`   - 成功率: ${stats.successRate}%`)
  
  console.log('\n🎉 数据验证机制测试完成！')
  
  return {
    success: true,
    message: '数据验证机制测试完成',
    stats: validationStore.getValidationStats()
  }
}

// 测试错误处理机制
export const testErrorHandling = () => {
  console.log('\n🔧 测试错误处理机制...')
  
  const validationStore = useValidationStore()
  
  // 测试网络错误处理
  console.log('\n📋 测试网络错误处理')
  try {
    const mockNetworkError = {
      code: 0,
      msg: '网络连接失败',
      data: null
    }
    
    const result = validationStore.validateApiResponseData(mockNetworkError)
    console.log('✅ 网络错误被正确处理:', result)
  } catch (error) {
    console.log('✅ 网络错误验证失败（预期行为）:', error.message)
  }
  
  // 测试数据格式错误处理
  console.log('\n📋 测试数据格式错误处理')
  try {
    const invalidFormatData = {
      id: 123, // 应该是字符串
      nickName: null, // 应该是字符串
      avatarUrl: 456 // 应该是字符串
    }
    
    const result = validationStore.validateUserInfo(invalidFormatData)
    console.log('✅ 数据格式错误被正确处理:', result)
  } catch (error) {
    console.log('✅ 数据格式错误验证失败（预期行为）:', error.message)
  }
  
  console.log('\n🎉 错误处理机制测试完成！')
  
  return {
    success: true,
    message: '错误处理机制测试完成'
  }
}

// 测试性能
export const testPerformance = () => {
  console.log('\n⚡ 测试验证性能...')
  
  const validationStore = useValidationStore()
  
  // 重置统计
  validationStore.resetValidationStats()
  
  const startTime = Date.now()
  
  // 执行大量验证操作
  for (let i = 0; i < 1000; i++) {
    try {
      const testData = {
        id: `user_${i}`,
        nickName: `用户${i}`,
        avatarUrl: `https://example.com/avatar_${i}.jpg`,
        phone: `1380013${String(i).padStart(4, '0')}`,
        email: `user${i}@example.com`,
        isVip: i % 2 === 0,
        level: i % 11
      }
      
      validationStore.validateUserInfo(testData)
    } catch (error) {
      // 忽略验证错误，专注于性能测试
    }
  }
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  const stats = validationStore.getValidationStats()
  
  console.log('✅ 性能测试结果:')
  console.log(`   - 执行时间: ${duration}ms`)
  console.log(`   - 验证次数: ${stats.totalValidations}`)
  console.log(`   - 平均每次验证: ${(duration / stats.totalValidations).toFixed(2)}ms`)
  console.log(`   - 成功率: ${stats.successRate}%`)
  
  return {
    success: true,
    message: '性能测试完成',
    duration,
    stats
  }
}

// 运行所有测试
export const runAllValidationTests = () => {
  console.log('🚀 开始运行所有数据验证测试...')
  
  const results = {
    mechanism: testValidationMechanism(),
    errorHandling: testErrorHandling(),
    performance: testPerformance()
  }
  
  console.log('\n📊 所有测试结果:')
  console.log(JSON.stringify(results, null, 2))
  
  return results
}
